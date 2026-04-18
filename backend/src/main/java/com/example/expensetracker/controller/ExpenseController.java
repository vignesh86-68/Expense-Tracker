package com.example.expensetracker.controller;

import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.create(user.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAll(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        String email = user.getUsername();

        if (month != null && year != null) {
            return ResponseEntity.ok(expenseService.getByMonthAndYear(email, month, year));
        } else if (category != null) {
            return ResponseEntity.ok(expenseService.getByCategory(email, category));
        } else if (startDate != null && endDate != null) {
            return ResponseEntity.ok(expenseService.getByDateRange(email, startDate, endDate));
        }
        return ResponseEntity.ok(expenseService.getAllByUser(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> update(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.update(user.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        expenseService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
