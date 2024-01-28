#include <math.h>
#include <stdbool.h>
#include <stdlib.h>

#include "vector.h"

bool isZero(Vector2* vector) {
    return vector->x == 0 && vector->y == 0;
}

void handleSomeVariation(Vector2* vector, int minThreshold, int maxThreshold) {
    if (vector->x > minThreshold && vector->x < maxThreshold && vector->y > minThreshold && vector->y < maxThreshold) {
        vector->x = 0;
        vector->y = 0;
    }
}

void normalize(Vector2* vector) {
    if (isZero(vector)) return;

    float length = sqrt(vector->x * vector->x + vector->y * vector->y);
    vector->x /= length;
    vector->y /= length;
}

Vector2 normalized(Vector2 vector) {
    if (isZero(&vector)) return vector;

    float length = sqrt(vector.x * vector.x + vector.y * vector.y);
    Vector2* newVector = malloc(sizeof(Vector2));
    newVector->x = vector.x / length;
    newVector->y = vector.y / length;
    return *newVector;
}

void add (Vector2* vector, Vector2 other) {
    vector->x += other.x;
    vector->y += other.y;
}

void scale(Vector2* vector, float scale) {
    vector->x *= scale;
    vector->y *= scale;
}
