import os
import sys
import argparse
import subprocess
import shutil
import socket
import threading
import platform
import time

# Colors
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

def log_info(msg):
    print(f"{GREEN}[CLI]{RESET} {msg}", flush=True)

def log_warn(msg):
    print(f"{YELLOW}[CLI-WARN]{RESET} {msg}", flush=True)

def log_error(msg):
    print(f"{RED}[CLI-ERROR]{RESET} {msg}", file=sys.stderr, flush=True)

def check_command_exists(cmd):
    try:
        subprocess.run([cmd, "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, shell=True)
        return True
    except Exception:
        return False

def check_prerequisites():
    log_info("Checking system prerequisites...")
    node_ok = check_command_exists("node")
    npm_ok = check_command_exists("npm")
    
    if not node_ok:
        log_error("Node.js is not installed or not in PATH. Please install Node.js (v16+) to proceed.")
        return False
    if not npm_ok:
        log_error("npm is not installed or not in PATH. Please install npm to proceed.")
        return False
        
    log_info("Node.js and npm detected successfully.")
    
    # Check MongoDB
    mongo_running = False
    try:
        with socket.create_connection(("127.0.0.1", 27017), timeout=1.0):
            mongo_running = True
    except Exception:
        pass
        
    if mongo_running:
        log_info("MongoDB server detected running on localhost:27017.")
    else:
        log_warn("MongoDB does not seem to be running on localhost:27017. Please ensure it is running before starting the app.")
        
    return True

def setup_cmd(args):
    if not check_prerequisites():
        sys.exit(1)
        
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    server_dir = os.path.join(root_dir, "server")
    client_dir = os.path.join(root_dir, "client")
    
    # 1. Environment variable configuration
    env_file = os.path.join(server_dir, ".env")
    env_example = os.path.join(server_dir, ".env.example")
    if not os.path.exists(env_file):
        if os.path.exists(env_example):
            log_info(f"Creating .env file from .env.example...")
            shutil.copy(env_example, env_file)
        else:
            log_info(f"Creating default .env file in server...")
            with open(env_file, "w") as f:
                f.write("PORT=5000\nMONGO_URI=mongodb://127.0.0.1:27017/car_rental_db\nJWT_SECRET=supersecretkeyforcarrentalproject\nNODE_ENV=development\n")
    else:
        log_info(".env file already exists in server/.")
        
    # 2. Install backend dependencies
    log_info("Installing backend dependencies in server/...")
    try:
        subprocess.run(["npm", "install"], cwd=server_dir, shell=True, check=True)
        log_info("Backend dependencies installed successfully.")
    except subprocess.CalledProcessError as e:
        log_error(f"Failed to install backend dependencies: {e}")
        sys.exit(1)
        
    # 3. Install frontend dependencies
    log_info("Installing frontend dependencies in client/...")
    try:
        subprocess.run(["npm", "install"], cwd=client_dir, shell=True, check=True)
        log_info("Frontend dependencies installed successfully.")
    except subprocess.CalledProcessError as e:
        log_error(f"Failed to install frontend dependencies: {e}")
        sys.exit(1)
        
    print(f"\n{GREEN}{BOLD}Setup complete! Run 'car-rental seed' then 'car-rental start' to launch the system.{RESET}\n")

def seed_cmd(args):
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    server_dir = os.path.join(root_dir, "server")
    
    log_info("Seeding database with demo data...")
    try:
        subprocess.run(["npm", "run", "seed"], cwd=server_dir, shell=True, check=True)
        log_info("Database seeded successfully.")
    except subprocess.CalledProcessError as e:
        log_error(f"Failed to seed database: {e}")
        sys.exit(1)

def log_reader(pipe, prefix, color):
    try:
        with pipe:
            for line in iter(pipe.readline, ''):
                if line:
                    print(f"{color}{prefix}{RESET} {line.strip()}", flush=True)
    except Exception as e:
        pass

def kill_process(proc):
    if proc.poll() is None:
        if platform.system() == "Windows":
            # Force termination of the process tree
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()

def start_cmd(args):
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    server_dir = os.path.join(root_dir, "server")
    client_dir = os.path.join(root_dir, "client")
    
    # Check port availability
    # Server port is 5000
    # Client port defaults to 5173
    s_port = 5000
    c_port = 5173
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(('127.0.0.1', s_port)) == 0:
            log_warn(f"Port {s_port} seems to be in use. The backend server might fail to start if it is already running.")
            
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(('127.0.0.1', c_port)) == 0:
            log_warn(f"Port {c_port} seems to be in use. The frontend client might run on a different port.")

    log_info("Starting Backend and Frontend servers concurrently...")
    log_info("Press Ctrl+C to stop both servers.")
    
    # Spawn backend
    backend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=server_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=True
    )
    
    # Spawn frontend
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=client_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=True
    )
    
    # Start output forwarding threads
    t_backend = threading.Thread(target=log_reader, args=(backend_proc.stdout, "[Backend]", GREEN), daemon=True)
    t_frontend = threading.Thread(target=log_reader, args=(frontend_proc.stdout, "[Frontend]", CYAN), daemon=True)
    
    t_backend.start()
    t_frontend.start()
    
    try:
        # Keep running and check if either process died unexpectedly
        while True:
            if backend_proc.poll() is not None:
                log_error(f"Backend server exited unexpectedly with code {backend_proc.returncode}.")
                break
            if frontend_proc.poll() is not None:
                log_error(f"Frontend client exited unexpectedly with code {frontend_proc.returncode}.")
                break
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("")
        log_info("Stopping servers...")
    finally:
        kill_process(backend_proc)
        kill_process(frontend_proc)
        log_info("Servers stopped.")

def main():
    parser = argparse.ArgumentParser(
        description="Bharath Rental System Administration CLI Runner",
        formatter_class=argparse.RawTextHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Setup parser
    setup_parser = subparsers.add_parser("setup", help="Install client & server dependencies and setup configuration")
    
    # Seed parser
    seed_parser = subparsers.add_parser("seed", help="Seed database with demo Indian vehicles, accounts, and bookings")
    
    # Start parser
    start_parser = subparsers.add_parser("start", help="Concurrently start client and server development servers")
    
    args = parser.parse_args()
    
    if args.command == "setup":
        setup_cmd(args)
    elif args.command == "seed":
        seed_cmd(args)
    elif args.command == "start":
        start_cmd(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
