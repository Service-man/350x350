insert into public.issue_clusters (
  bike_brand,
  bike_model,
  component,
  issue_title,
  issue_summary,
  severity,
  mileage_band,
  mention_count,
  trend_percentage,
  confidence_level,
  source_type
) values
('Royal Enfield', 'Classic 350', 'Battery', 'Battery drain after accessory fitment', 'Riders report weak starts or battery drain after installing auxiliary lights, horns, or phone chargers without clean relay wiring.', 'medium', '3,000-12,000 km', 28, 12, 'medium', 'seed'),
('Royal Enfield', 'Classic 350', 'Chain/Sprocket', 'Chain noise after city riding', 'Chain noise and adjustment complaints appear around frequent stop-go riding and delayed lubrication intervals.', 'low', '4,000-10,000 km', 19, 6, 'low', 'seed'),
('Royal Enfield', 'Hunter 350', 'Suspension', 'Rear suspension stiffness', 'Owners commonly mention a firm rear setup on broken urban roads, especially with solo riding.', 'low', '0-8,000 km', 34, 8, 'medium', 'seed'),
('Royal Enfield', 'Meteor 350', 'Electrical', 'Battery/electrical warning', 'Seed cluster for display warnings and intermittent electrical alerts that should be validated with first-party logs.', 'medium', '5,000-15,000 km', 16, 5, 'low', 'seed'),
('Honda', 'CB350', 'Chain/Sprocket', 'Chain noise / early adjustment need', 'Some riders log chain noise or frequent adjustment needs during city use and monsoon riding.', 'low', '3,000-9,000 km', 21, 7, 'low', 'seed'),
('Royal Enfield', 'Himalayan 450', 'Engine/Cooling', 'Heating in slow traffic', 'Slow city traffic can trigger rider concern around heat management and fan behavior.', 'medium', '0-10,000 km', 24, 10, 'low', 'seed'),
('KTM', 'Duke 390', 'Engine/Cooling', 'Frequent fan cycles in city traffic', 'Fan cycling is often noticed in dense traffic; this cluster tracks ownership concern, not a confirmed defect.', 'medium', '0-20,000 km', 31, 4, 'medium', 'seed'),
('Triumph', 'Speed 400', 'General Ownership', 'First-service cost confusion', 'Riders compare first-service costs across cities and garage types, creating uncertainty about expected ownership spend.', 'low', '500-2,000 km', 18, 14, 'low', 'seed')
on conflict do nothing;
