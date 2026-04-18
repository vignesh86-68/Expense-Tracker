package com.example.expensetracker.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private BigDecimal totalThisMonth;
    private BigDecimal totalLastMonth;
    private BigDecimal totalThisYear;
    private int expenseCountThisMonth;
    private List<CategoryTotal> categoryBreakdown;
    private List<ExpenseResponse> recentExpenses;
    private List<MonthlyTotal> monthlyTrend;
}
