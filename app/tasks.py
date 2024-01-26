import csv
import io
from .workers import celery
from flask import current_app as app
from celery.schedules import crontab
from flask_mail import Message
from config import Config
from flask import render_template_string
from . import mail
from datetime import datetime, timedelta
from .models import User, Order, Product
from sqlalchemy import Date, cast
from sqlalchemy.orm import joinedload


@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(crontab(hour=13, minute=30), daily_task.s(), name='daily_task')
    sender.add_periodic_task(crontab(hour=5, minute=30), monthly_task.s(), name='monthly_task')


@celery.task()
def send_async_email(email_msg):
    with app.app_context():
        msg = Message(email_msg['subject'],
                      sender=Config.MAIL_DEFAULT_SENDER,
                      recipients=[email_msg['to']])
        msg.body = email_msg['body']
        if email_msg.get('attachment', None):
            with app.open_resource('templates/monthly_report.html') as f:
                template = f.read().decode('utf-8')
            html = render_template_string(template, attachment=email_msg['attachment'])
            msg.attach("report.html", "text/html", html)
        if email_msg.get('csv', None):
            msg.attach("product_report.csv", "text/csv", email_msg['csv'])
        mail.send(msg)


@celery.task()
def daily_task():
    current_date = datetime.utcnow().date()
    users = User.query.all()
    for user in users:
        order = Order.query.filter(Order.user_id == user.id, cast(Order.date, Date) == current_date).first()
        if order is None:
            email_msg = {
                'subject': 'New Deals!',
                'to': user.email,
                'body': """
                        Dear User,

                        We noticed you haven't visited recently. We have excellent deals waiting for you.
                        Please visit :)

                        Thank you
                        Grocery Team
                        """
            }
            send_async_email.delay(email_msg)


@celery.task()
def monthly_task():
    today = datetime.today()
    first_day = today.replace(day=1) - timedelta(days=1)
    last_day = first_day.replace(day=1) - timedelta(days=1)
    orders = Order.query.filter(Order.date.between(first_day, last_day)).all()
    report = dict()
    for order in orders:
        user = User.query.filter_by(id=order.user_id).first()
        product = Product.query.filter_by(id=order.product_id).first()
        total_spent = product.rate * order.quantity
        user_info = report.get(user.id, None)
        if user_info:
            user_info['product'] = user_info['product'] + [
                {'name': product.name, 'quantity': order.quantity, 'rate': product.rate, 'total': total_spent,
                 'datetime': order.date}]
            user_info['total'] = user_info['total'] + total_spent
        else:
            user_info = dict()
            user_info['username'] = user.username
            user_info['email'] = user.email
            user_info['product'] = [
                {'name': product.name, 'quantity': order.quantity, 'rate': product.rate, 'total': total_spent,
                 'datetime': order.date}]
            user_info['total'] = total_spent
        report[user.id] = user_info
    for details in report.values():
        email_msg = {
            'subject': 'Monthly Details',
            'to': details['email'],
            'body': """
                    Dear User,

                    Please find the attached monthly report.

                    Thank you
                    Grocery Team
            """,
            'attachment': details
        }
        send_async_email.delay(email_msg)


@celery.task()
def generate_product_report(user_email):
    products = Product.query.options(joinedload(Product.orders)).all()
    csv_file = io.StringIO()
    writer = csv.writer(csv_file)
    writer.writerow(
        ["Name", "Stock Remaining", "Manufacturing Date", "Expiry Date", "Unit", "Price", "Number of Units Sold"])
    for product in products:
        units_sold = sum(order.quantity for order in product.orders)
        stock_remaining = product.quantity - units_sold
        writer.writerow(
            [product.name, stock_remaining, product.manufacturingDate, product.expiryDate, product.unit, product.rate,
             units_sold])
    email_msg = {
        'subject': 'Product Report',
        'to': user_email,
        'body': """
            Dear Manager,
            
            Please find the attached product report
            
            Thank You
            Grocery Store
        """,
        'csv': csv_file.getvalue()
    }
    send_async_email.delay(email_msg)
