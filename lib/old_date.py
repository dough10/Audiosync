import datetime
from dateutil.relativedelta import relativedelta

today = datetime.date.today()
old_date = today - relativedelta(months=1)