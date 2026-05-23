# Python — Functions & Decorators

## Learning Objectives
- Understand how Python functions work as first-class objects
- Write and apply decorators to modify function behavior
- Use `functools.wraps` to preserve function metadata
- Build practical decorators: timer, retry, cache, login_required

---

## 1. Functions as First-Class Objects

In Python, functions are objects. You can assign them to variables, pass them as arguments, and return them from other functions.

```python
def greet(name):
    return f"Hello, {name}!"

# Assign to variable
say_hello = greet
print(say_hello("Alice"))  # Hello, Alice!

# Pass as argument
def apply(func, value):
    return func(value)

print(apply(greet, "Bob"))  # Hello, Bob!
```

---

## 2. What is a Decorator?

A decorator is a function that **wraps another function** to extend or modify its behavior — without changing the original function's code.

Think of it like a **coffee cup sleeve** — the sleeve (decorator) adds insulation without changing the cup (function) itself.

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Before the function runs")
        result = func(*args, **kwargs)
        print("After the function runs")
        return result
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()
# Output:
# Before the function runs
# Hello!
# After the function runs
```

The `@my_decorator` syntax is equivalent to: `say_hello = my_decorator(say_hello)`

---

## 3. Preserving Metadata with functools.wraps

Without `functools.wraps`, the wrapped function loses its name and docstring:

```python
from functools import wraps

def timer(func):
    @wraps(func)  # Preserves __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        import time
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    """This function is slow."""
    import time
    time.sleep(0.1)

slow_function()
print(slow_function.__name__)  # slow_function (not 'wrapper')
```

---

## 4. Practical Decorators

### Retry Decorator
```python
from functools import wraps
import time

def retry(max_attempts=3, delay=1.0):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    print(f"Attempt {attempt} failed: {e}. Retrying in {delay}s...")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.5)
def fetch_data(url):
    # Simulating a flaky network call
    import random
    if random.random() < 0.7:
        raise ConnectionError("Network timeout")
    return {"data": "success"}
```

### Cache Decorator (Memoization)
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(50))  # Instant — cached results
```

---

## 5. Class-Based Decorators

```python
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0
        self.__name__ = func.__name__

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"{self.func.__name__} called {self.count} time(s)")
        return self.func(*args, **kwargs)

@CountCalls
def add(a, b):
    return a + b

add(1, 2)  # add called 1 time(s)
add(3, 4)  # add called 2 time(s)
```

---

## 💡 Key Takeaways

- Decorators use the **closure** pattern to wrap functions
- Always use `@functools.wraps` to preserve function metadata
- Decorators with arguments need **three levels** of nesting
- Python's built-in decorators: `@property`, `@classmethod`, `@staticmethod`, `@lru_cache`
- Flask/Django use decorators heavily: `@app.route()`, `@login_required`

---

## Quiz

1. What does `@functools.wraps(func)` do in a decorator?
2. What is the difference between `@decorator` and `@decorator()`?
3. How would you write a decorator that logs the arguments passed to a function?
