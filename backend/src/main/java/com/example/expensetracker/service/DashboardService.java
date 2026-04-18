package com.example.expensetracker.service;

import com.example.expensetracker.dto.CategoryTotal;
import com.example.expensetracker.dto.DashboardStats;
import com.example.expensetracker.dto.MonthlyTotal;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final ExpenseService expenseService;

    public DashboardStats getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        LocalDate lastMonthDate = now.minusMonths(1);
        int lastMonth = lastMonthDate.getMonthValue();
        int lastMonthYear = lastMonthDate.getYear();

        BigDecimal totalThisMonth = expenseRepository.getTotalByUserIdAndMonthAndYear(user.getId(), currentMonth,
                currentYear);
        BigDecimal totalLastMonth = expenseRepository.getTotalByUserIdAndMonthAndYear(user.getId(), lastMonth,
                lastMonthYear);

        // Year total
        BigDecimal totalThisYear = BigDecimal.ZERO;
        for (int m = 1; m <= 12; m++) {
            BigDecimal t = expenseRepository.getTotalByUserIdAndMonthAndYear(user.getId(), m, currentYear);
            if (t != null)
                totalThisYear = totalThisYear.add(t);
        }

        // Category breakdown this month
        List<Object[]> rawCategories = expenseRepository.getCategoryTotals(user.getId(), currentMonth, currentYear);
        BigDecimal monthTotal = totalThisMonth != null ? totalThisMonth : BigDecimal.ZERO;

        List<CategoryTotal> categories = rawCategories.stream().map(row -> {
            String cat = (String) row[0];
            BigDecimal total = (BigDecimal) row[1];
            double pct = monthTotal.compareTo(BigDecimal.ZERO) > 0
                    ? total.divide(monthTotal, 4, RoundingMode.HALF_UP).doubleValue() * 100
                    : 0;
            return CategoryTotal.builder().category(cat).total(total).percentage(pct).build();
        }).collect(Collectors.toList());

        // Recent expenses (last 5)
        var recent = expenseRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream().limit(5)
                .map(expenseService::mapToResponse)
                .collect(Collectors.toList());

        // Monthly trend (last 6 months)
        List<MonthlyTotal> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate d = now.minusMonths(i);
            BigDecimal t = expenseRepository.getTotalByUserIdAndMonthAndYear(user.getId(), d.getMonthValue(),
                    d.getYear());
            trend.add(MonthlyTotal.builder()
                    .month(d.getMonthValue())
                    .year(d.getYear())
                    .total(t != null ? t : BigDecimal.ZERO)
                    .label(Month.of(d.getMonthValue()).getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .build());
        }

        int count = expenseRepository.findByUserIdAndMonthAndYear(user.getId(), currentMonth, currentYear).size();

        return DashboardStats.builder()
                .totalThisMonth(monthTotal)
                .totalLastMonth(totalLastMonth != null ? totalLastMonth : BigDecimal.ZERO)
                .totalThisYear(totalThisYear)
                .expenseCountThisMonth(count)
                .categoryBreakdown(categories)
                .recentExpenses(recent)
                .monthlyTrend(trend)
                .build();
    }
}
