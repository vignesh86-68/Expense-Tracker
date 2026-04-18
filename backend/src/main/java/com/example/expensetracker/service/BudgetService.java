package com.example.expensetracker.service;

import com.example.expensetracker.dto.BudgetRequest;
import com.example.expensetracker.dto.BudgetResponse;
import com.example.expensetracker.entity.Budget;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetResponse createOrUpdate(String email, BudgetRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = budgetRepository
                .findByUserIdAndCategoryAndMonthAndYear(user.getId(), request.getCategory(), request.getMonth(), request.getYear())
                .orElse(Budget.builder().user(user).build());

        budget.setCategory(request.getCategory());
        budget.setLimitAmount(request.getLimitAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        return mapToResponse(budgetRepository.save(budget), user.getId());
    }

    public List<BudgetResponse> getByMonthAndYear(String email, int month, int year) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year)
                .stream().map(b -> mapToResponse(b, user.getId())).collect(Collectors.toList());
    }

    public void delete(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        budgetRepository.delete(budget);
    }

    private BudgetResponse mapToResponse(Budget budget, Long userId) {
        BigDecimal spent = expenseRepository.getTotalByCategoryAndMonthAndYear(
                userId, budget.getCategory(), budget.getMonth(), budget.getYear());
        if (spent == null) spent = BigDecimal.ZERO;

        double pct = budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0;

        return BudgetResponse.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .limitAmount(budget.getLimitAmount())
                .spent(spent)
                .month(budget.getMonth())
                .year(budget.getYear())
                .percentageUsed(Math.min(pct, 100))
                .build();
    }
}
