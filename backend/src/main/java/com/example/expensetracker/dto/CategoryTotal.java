package com.example.expensetracker.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTotal {
    private String category;
    private BigDecimal total;
    private double percentage;
}
