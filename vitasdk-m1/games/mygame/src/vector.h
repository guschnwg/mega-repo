#pragma once

typedef struct Vector2 {
    float x, y;
} Vector2;

bool isZero(Vector2* vector);
void handleSomeVariation(Vector2* vector, int minThreshold, int maxThreshold);
void normalize(Vector2* vector);
Vector2 normalized(Vector2 vector);
void add (Vector2* vector, Vector2 other);
void scale(Vector2* vector, float scale);
