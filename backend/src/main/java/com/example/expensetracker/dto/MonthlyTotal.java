package com.example.expensetracker.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTotal {
    private int month;
    private int year;
    private BigDecimal total;
    private String label;
}
