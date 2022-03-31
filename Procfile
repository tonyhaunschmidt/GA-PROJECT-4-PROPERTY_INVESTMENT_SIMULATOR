web: python manage.py runserver 0.0.0.0:$PORT --noreload
worker: celery -A project worker -l info --pool=solo
beat: celery -A project beat -l INFO