<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { background: #a63300; color: white; padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
        .content { padding: 40px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8faf9; padding: 20px; border-radius: 15px; border: 1px solid #eee; }
        .stat-label { font-size: 10px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 1px; }
        .stat-value { font-size: 20px; font-weight: 900; color: #2c2f30; margin-top: 5px; }
        .footer { background: #f8faf9; padding: 20px; text-align: center; font-size: 12px; color: #aaa; }
        .ai-badge { display: inline-block; background: #00528b; color: white; padding: 4px 10px; rounded-radius: 5px; font-size: 9px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="ai-badge">AI GENERATED REPORT</div>
            <h1>{{ $tenant->name }}</h1>
            <p style="opacity: 0.8; font-size: 14px;">Daily Performance Insight</p>
        </div>
        <div class="content">
            <h2 style="font-size: 18px; color: #2c2f30;">Greetings, Administrator</h2>
            <p style="color: #595c5d; line-height: 1.6; margin-bottom: 30px;">Your automated daily business summary is ready. Here's how your node performed today.</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Revenue</div>
                    <div class="stat-value">₹{{ number_format($stats['revenue'], 2) }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Orders</div>
                    <div class="stat-value">{{ $stats['orders'] }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg Order Value</div>
                    <div class="stat-value">₹{{ number_format($stats['avg_order'], 2) }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Active Shifts</div>
                    <div class="stat-value">{{ $stats['shifts'] }}</div>
                </div>
            </div>

            <div style="background: #fff8f5; padding: 20px; border-radius: 15px; border-left: 4px solid #a63300;">
                <h3 style="font-size: 14px; margin-top: 0; color: #a63300;">AI Forecast & Trends</h3>
                <p style="font-size: 13px; color: #595c5d; margin: 0;">{{ $stats['ai_insight'] }}</p>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Foodsoul SaaS Platform. All rights reserved.
        </div>
    </div>
</body>
</html>
