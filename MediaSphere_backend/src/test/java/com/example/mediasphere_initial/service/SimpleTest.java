package com.example.mediasphere_initial.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Simple test to verify test setup is working
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class SimpleTest {

    @Test
    void testSetup_ShouldWork() {
        // Given
        String testValue = "Hello World";

        // When
        int length = testValue.length();

        // Then
        assertThat(length).isEqualTo(11);
        assertThat(testValue).contains("World");
    }

    @Test
    void basicMath_ShouldWork() {
        // Given
        int a = 5;
        int b = 3;

        // When
        int sum = a + b;

        // Then
        assertThat(sum).isEqualTo(8);
    }
}
