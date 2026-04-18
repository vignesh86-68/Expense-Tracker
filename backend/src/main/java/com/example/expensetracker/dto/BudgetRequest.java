package com.example.expensetracker.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRequest {
    @NotBlank private String category;
    @NotNull @Positive private BigDecimal limitAmount;
    @NotNull @Min(1) @Max(12) private Integer month;
    @NotNull private Integer year;
}
