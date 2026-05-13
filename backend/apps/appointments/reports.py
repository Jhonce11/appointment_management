from django.db import connection


def get_delivery_time_report(date_from: str, date_to: str) -> list[dict]:
    query = """
        SELECT
            product_line,
            COUNT(*) AS total_deliveries,
            AVG(
                EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 3600
            ) AS avg_hours,
            AVG(
                EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 60
            ) AS avg_minutes
        FROM appointments_appointment
        WHERE status = 'delivered'
          AND scheduled_at BETWEEN %(date_from)s AND %(date_to)s
        GROUP BY product_line
        ORDER BY total_deliveries DESC;
    """
    with connection.cursor() as cursor:
        cursor.execute(query, {"date_from": date_from, "date_to": date_to})
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    return [dict(zip(columns, row)) for row in rows]
