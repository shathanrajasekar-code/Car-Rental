from setuptools import setup, find_packages

setup(
    name="car-rental-admin-cli",
    version="1.0.0",
    description="CLI tool to manage Bharath Car Rental Admin System",
    packages=find_packages(),
    entry_points={
        'console_scripts': [
            'car-rental=car_rental_cli.main:main',
        ],
    },
    python_requires='>=3.6',
)
