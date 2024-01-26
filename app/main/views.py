from . import main
from flask import render_template, request


@main.route('/')
def index():
    return render_template('index.html')
