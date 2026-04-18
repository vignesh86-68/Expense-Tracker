package com.example.expensetracker.controller;

import com.example.expensetracker.dto.BudgetRequest;
import com.example.expensetracker.dto.BudgetResponse;
import com.example.expensetracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetResponse> createOrUpdate(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.createOrUpdate(user.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getByMonth(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(budgetService.getByMonthAndYear(user.getUsername(), month, year));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        budgetService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
