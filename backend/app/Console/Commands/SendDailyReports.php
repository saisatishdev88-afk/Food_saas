<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use App\Models\Order;
use App\Models\Shift;
use App\Mail\DailyReportMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendDailyReports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reports:send-daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate and send daily business reports to all restaurant owners';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting daily report distribution...');
        $tenants = Tenant::where('status', 'active')->get();

        foreach ($tenants as $tenant) {
            $this->line("Processing report for: {$tenant->name}");

            // Gather stats for today
            $today = Carbon::today();
            
            $orders = Order::where('tenant_id', $tenant->id)
                ->whereDate('created_at', $today)
                ->get();

            $revenue = $orders->where('payment_status', 'paid')->sum('total_amount');
            $orderCount = $orders->count();
            $avgOrder = $orderCount > 0 ? $revenue / $orderCount : 0;

            $shifts = Shift::where('tenant_id', $tenant->id)
                ->whereDate('clock_in', $today)
                ->count();

            // Mock AI Insight
            $aiInsights = [
                "Demand peak detected at lunch hours. Consider increasing staff for tomorrow's shift.",
                "Inventory for key ingredients is optimal. No urgent replenishment needed.",
                "Revenue is up 12% compared to last Wednesday. Keep up the promotional momentum!",
                "Average prep time is decreasing, leading to higher customer satisfaction."
            ];
            $insight = $aiInsights[array_rand($aiInsights)];

            $stats = [
                'revenue' => $revenue,
                'orders' => $orderCount,
                'avg_order' => $avgOrder,
                'shifts' => $shifts,
                'ai_insight' => $insight
            ];

            // Send Mail
            try {
                Mail::to($tenant->email)->send(new DailyReportMail($tenant, $stats));
                $this->info("Successfully sent report to {$tenant->email}");
            } catch (\Exception $e) {
                $this->error("Failed to send report to {$tenant->email}: " . $e->getMessage());
            }
        }

        $this->info('Daily report distribution completed.');
    }
}
