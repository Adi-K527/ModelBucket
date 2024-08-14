from setuptools import setup, find_packages
import codecs
import os


VERSION = '0.0.11'
DESCRIPTION = 'ModelBucket deployment package'
LONG_DESCRIPTION = 'A package that allows you to deploy models using ModelBucket.'

# Setting up
setup(
    name="model-bucket",
    version=VERSION,
    author="Adi_K527",
    author_email="<adikandakurtikar2@gmail.com>",
    description=DESCRIPTION,
    long_description_content_type="text/markdown",
    long_description=LONG_DESCRIPTION,
    packages=find_packages(),
    install_requires=['requests'],
    keywords=['python', 'ML', 'Deployment'],
    classifiers=[
        "Development Status :: 1 - Planning",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Operating System :: Unix",
        "Operating System :: MacOS :: MacOS X",
        "Operating System :: Microsoft :: Windows", 
    ]
)

