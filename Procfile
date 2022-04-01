web: python manage.py runserver 0.0.0.0:$PORT --noreload
worker: celery -A prj worker --beat --scheduler django --loglevel=info