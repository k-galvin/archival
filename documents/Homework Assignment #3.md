# Homework Assignment #3

### Problem 7.1, Stephens page 169
Most of the comments were removed as they were redundant and cluttered the code.

```csharp
// Use Euclid's algorithm to calculate the GCD.
private long GCD( long a, long b )
{
    for( ; ; )
    {
        long remainder = a % b;
        If( remainder == 0 ) return b;
        a = b;
        b = remainder;
    };
}
```

### Problem 7.2, Stephens page 170

According to the textbook, you might end up with those types of bad comments if:
1. A top down approach leads to overly detailed comments that are redundant and unhelpful.
2. Comments are added after writing the code, leading to a what and not a why approach.

### Problem 7.4, Stephens page 170

```csharp
// Use Euclid's algorithm to calculate the GCD.
private long GCD(long a, long b)
{
    // Offensive approach that loudly warns if there is an invalid input.
    Debug.Assert(a > 0, "Parameter 'a' must be positive!");
    Debug.Assert(b > 0, "Parameter 'b' must be positive!");

    for (; ; )
    {
        long remainder = a % b;
        if (remainder == 0) return b;
        a = b;
        b = remainder;
    };
}
```

### Problem 7.5, Stephens page 170

Yes, I should add error handling to the code. Offensive programming helps catch bugs during development, but error handling ensures the program can actually handle unexpected situations without crashing.

### Problem 7.7, Stephens page 170

**Top-Down Design for Driving to the Supermarket:**
1. Enter the car and get ready to drive.
2. Start the engine.
3. Navigate from your current location to the supermarket.
4. Park the car and exit.

**Assumptions:**
- The car is working and has enough gas.
- You have the car keys.
- You know the location of the nearest supermarket.
- You know how to drive.

### Problem 8.1, Stephens page 199

```python
def isRelativelyPrime(a, b):
    """Return True if a and b are relatively prime (GCD is 1)."""
    # By definition, 1 and -1 are relatively prime to every integer.
    # They are the only numbers relatively prime to 0.
    if a == 0: return abs(b) == 1
    if b == 0: return abs(a) == 1
    return gcd(a, b) == 1

# Test Program
def test_isRelativelyPrime():
    test_cases = [
        (21, 35, False), # Both divisible by 7
        (8, 9, True),    # No common factors other than 1
        (1, 100, True),  # 1 is relatively prime to everything
        (0, 1, True),    # 1 is relatively prime to 0
        (0, 5, False),   # 5 is not relatively prime to 0
        (-21, 35, False),# Negative numbers
        (17, 19, True)   # Two primes
    ]
    
    for a, b, expected in test_cases:
        result = isRelativelyPrime(a, b)
        print(f"Testing ({a}, {b}): Expected {expected}, Got {result}")
        assert result == expected
```

### Problem 8.3, Stephens page 199

I used black-box testing techniques. I focused on the the definition of "relatively prime" without relying on the internal logic of the isRelativelyPrime function.

Black-box, grey-box, and white box testing could be used for this program. It is an example of a case where we know both the inner workings of the program's code to test in a white box approach, and are able to use the definition of relatively prime to test it in a black box approach. However, exhaustively would not be an appropriate choice for this program as testing every unique integer combination would be impossible.

### Problem 8.5, Stephens page 199 - 200

**Implementation in Python:**

```python
import math

def GCD(a, b):
    a = abs(a)
    b = abs(b)

    if a == 0: return b
    if b == 0: return a

    while True:
        remainder = a % b
        if remainder == 0: return b
        a = b
        b = remainder

def areRelativelyPrime(a, b):
    if a == 0: return abs(b) == 1
    if b == 0: return abs(a) == 1

    gcd = GCD(a, b)
    return gcd == 1

# Testing code
def run_tests():
    print(f"Relatively Prime (21, 35): {areRelativelyPrime(21, 35)}") # False
    print(f"Relatively Prime (8, 9): {areRelativelyPrime(8, 9)}")    # True
    print(f"Relatively Prime (0, 1): {areRelativelyPrime(0, 1)}")    # True
    print(f"Relatively Prime (0, 0): {areRelativelyPrime(0, 0)}")    # False

run_tests()
```

**Observations:**
I didn't find any bugs in my initial implementation. The testing code was beneficial because it  confirmed that edge cases (like 0 and 1) were handled according to the mathematical definition provided.

### Problem 8.9, Stephens page 200

Exhaustive testing falls into the black-box category. It involves testing every possible input to the system to see if it produces the correct output, regardless of the implementation of the code.

### Problem 8.11, Stephens page 200

**Lincoln Index Calculation:**
- Alice (A) found: {1, 2, 3, 4, 5} -> $n_1 = 5$
- Bob (B) found: {2, 5, 6, 7} -> $n_2 = 4$
- Carmen (C) found: {1, 2, 8, 9, 10} -> $n_3 = 5$

Using Alice and Bob:
- Common bugs ($c$): {2, 5} -> $c = 2$
- Estimate ($L$) = $(n_1 \times n_2) / c = (5 \times 4) / 2 = 10$

Total unique bugs found by all three: {1, 2, 3, 4, 5, 6, 7, 8, 9, 10} = 10 unique bugs.

If the estimate is 10 and we have already found 10, then **0 bugs** are estimated to be still at large (according to the Alice/Bob pair).

### Problem 8.12, Stephens page 200

If two testers find no bugs in common, the denominator in the Lincoln estimate formula is 0, which makes the estimate infinite. This implies that the testers have only begun and there are likely many more bugs to be found.
