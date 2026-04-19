import pandas as pd
import numpy as np
import json
import random
from faker import Faker
from datetime import datetime, timedelta
import os

fake = Faker()

def generate_data():
    num_staff = 50
    days = 90
    facilities = ['Sunrise LTC', 'City Health Clinic']
    roles = {
        'RN': {'base': 45.0, 'range': 5.0},
        'RPN': {'base': 32.0, 'range': 3.0},
        'PSW': {'base': 25.0, 'range': 3.0},
        'Admin': {'base': 28.0, 'range': 4.0}
    }
    
    staff = []
    # Generate staff
    for i in range(num_staff):
        role = random.choices(list(roles.keys()), weights=[0.2, 0.3, 0.4, 0.1])[0]
        facility = random.choices(facilities, weights=[0.7, 0.3])[0] # LTC has more staff
        base_pay = roles[role]['base'] + random.uniform(-roles[role]['range'], roles[role]['range'])
        
        # Anomaly 1: Unexplained variance for specific RNs. We pick 2 RNs and dock their pay by $2.50
        is_anomaly_rn = False
        if role == 'RN' and len([s for s in staff if s['role'] == 'RN' and s.get('is_anomaly_rn')]) < 2:
            base_pay -= 2.50
            is_anomaly_rn = True
            
        staff.append({
            'id': f'STF-{i+1:03d}',
            'name': fake.name(),
            'role': role,
            'facility': facility,
            'base_pay': round(base_pay, 2),
            'is_anomaly_rn': is_anomaly_rn
        })
        
    start_date = datetime.now() - timedelta(days=days)
    shifts = []
    
    # Anomaly 2: Subset of PSWs get 25% more weekend shifts
    psws = [s for s in staff if s['role'] == 'PSW' and s['facility'] == 'Sunrise LTC']
    overworked_psws = [s['id'] for s in psws[:3]]
    
    shift_id = 1
    for day_offset in range(days):
        current_date = start_date + timedelta(days=day_offset)
        is_weekend = current_date.weekday() >= 5
        
        for s in staff:
            # Not everyone works every day. Base probability of working: ~ 5/7
            prob = 0.71
            shift_type = 'Day'
            shift_hours = 8
            overtime_hours = 0
            
            # Weekend distribution
            if is_weekend:
                if s['id'] in overworked_psws:
                    prob = 0.95 # Highly likely to work weekend
                else:
                    prob = 0.4  # Less likely to work weekend
            
            if random.random() < prob:
                # Night shift distribution (mostly LTC, rarely clinic)
                if s['facility'] == 'Sunrise LTC' and random.random() < 0.25:
                    shift_type = 'Night'
                
                # Overtime distribution
                if random.random() < 0.15: # 15% chance of overtime
                    overtime_hours = random.choice([2, 4])
                    
                shifts.append({
                    'id': f'SHFT-{shift_id:04d}',
                    'person_id': s['id'],
                    'date': current_date.strftime('%Y-%m-%d'),
                    'shift_type': 'Weekend' if is_weekend else shift_type,
                    'hours_worked': shift_hours,
                    'overtime_hours': overtime_hours,
                    'is_weekend': is_weekend,
                })
                shift_id += 1

    # Ensure output dir exists
    os.makedirs('.tmp', exist_ok=True)
    
    with open('.tmp/synthetic_data.json', 'w') as f:
        json.dump({
            'staff': staff,
            'shifts': shifts
        }, f, indent=2)
        
    print(f"Generated {len(staff)} staff and {len(shifts)} shifts.")

if __name__ == '__main__':
    generate_data()
