# Machine Learning — Gradient Descent & Backpropagation

## Learning Objectives
- Understand gradient descent as an optimization algorithm
- Implement gradient descent from scratch in Python
- Explain the difference between batch, stochastic, and mini-batch GD
- Understand how backpropagation computes gradients

---

## 1. The Problem: Minimizing Loss

Training a ML model means finding the parameters (weights) that **minimize the loss function**.

The loss function measures how wrong our predictions are:
- **MSE (regression):** L = (1/n) Σ(y_pred - y_true)²
- **Cross-entropy (classification):** L = -Σ y_true · log(y_pred)

The challenge: how do we find the minimum of this function?

---

## 2. Gradient Descent Intuition

Imagine you're blindfolded on a hilly landscape and need to reach the lowest point. Your strategy:
1. Feel the slope under your feet (compute gradient)
2. Take a small step downhill (update parameters)
3. Repeat until you can't go lower (converge)

**The update rule:**
```
θ = θ - α · ∇L(θ)
```
- `θ` = parameters (weights)
- `α` = learning rate (step size)
- `∇L(θ)` = gradient of loss with respect to parameters

---

## 3. Implementation from Scratch

```python
import numpy as np
import matplotlib.pyplot as plt

class LinearRegressionGD:
    def __init__(self, learning_rate=0.01, epochs=1000):
        self.lr = learning_rate
        self.epochs = epochs
        self.weights = None
        self.bias = None
        self.loss_history = []

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0

        for epoch in range(self.epochs):
            # Forward pass
            y_pred = X @ self.weights + self.bias

            # Compute loss (MSE)
            loss = np.mean((y_pred - y) ** 2)
            self.loss_history.append(loss)

            # Compute gradients
            dw = (2 / n_samples) * X.T @ (y_pred - y)
            db = (2 / n_samples) * np.sum(y_pred - y)

            # Update parameters
            self.weights -= self.lr * dw
            self.bias -= self.lr * db

            if epoch % 100 == 0:
                print(f"Epoch {epoch}: Loss = {loss:.6f}")

        return self

    def predict(self, X):
        return X @ self.weights + self.bias

# Usage
np.random.seed(42)
X = np.random.randn(100, 2)
y = 3 * X[:, 0] + 1.5 * X[:, 1] + np.random.randn(100) * 0.5

model = LinearRegressionGD(learning_rate=0.05, epochs=500)
model.fit(X, y)
print(f"Learned weights: {model.weights}")  # Should be ~[3, 1.5]
```

---

## 4. Learning Rate: The Critical Hyperparameter

| Learning Rate | Effect |
|---|---|
| Too high (e.g. 1.0) | Overshoots minimum, diverges |
| Too low (e.g. 0.0001) | Converges very slowly |
| Just right (e.g. 0.01) | Smooth convergence |
| Adaptive (Adam, RMSprop) | Adjusts per parameter — best in practice |

```python
# Learning rate schedule — reduce on plateau
def lr_schedule(initial_lr, epoch, decay=0.95, step=100):
    return initial_lr * (decay ** (epoch // step))
```

---

## 5. Variants of Gradient Descent

### Batch GD
- Uses ALL training data per update
- Stable but slow for large datasets
- Memory: O(n)

### Stochastic GD (SGD)
- Uses ONE random sample per update
- Fast but noisy convergence
- Good for online learning

### Mini-Batch GD (most common)
```python
def mini_batch_gd(X, y, batch_size=32, epochs=100, lr=0.01):
    n = len(X)
    weights = np.zeros(X.shape[1])
    
    for epoch in range(epochs):
        # Shuffle data
        indices = np.random.permutation(n)
        X_shuffled, y_shuffled = X[indices], y[indices]
        
        for start in range(0, n, batch_size):
            X_batch = X_shuffled[start:start+batch_size]
            y_batch = y_shuffled[start:start+batch_size]
            
            # Compute gradient on mini-batch
            y_pred = X_batch @ weights
            grad = (2 / len(X_batch)) * X_batch.T @ (y_pred - y_batch)
            weights -= lr * grad
    
    return weights
```

---

## 6. Backpropagation

Backpropagation is gradient descent applied to **neural networks**, using the **chain rule** to compute gradients layer by layer.

```python
# Simple 2-layer neural network forward + backward pass
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    s = sigmoid(x)
    return s * (1 - s)

class TwoLayerNet:
    def __init__(self, input_size, hidden_size, output_size, lr=0.01):
        # Xavier initialization
        self.W1 = np.random.randn(input_size, hidden_size) * np.sqrt(2/input_size)
        self.b1 = np.zeros(hidden_size)
        self.W2 = np.random.randn(hidden_size, output_size) * np.sqrt(2/hidden_size)
        self.b2 = np.zeros(output_size)
        self.lr = lr

    def forward(self, X):
        self.z1 = X @ self.W1 + self.b1
        self.a1 = sigmoid(self.z1)
        self.z2 = self.a1 @ self.W2 + self.b2
        self.a2 = sigmoid(self.z2)
        return self.a2

    def backward(self, X, y, output):
        m = len(X)
        # Output layer gradient
        dL_da2 = 2 * (output - y) / m
        dL_dz2 = dL_da2 * sigmoid_derivative(self.z2)
        dW2 = self.a1.T @ dL_dz2
        db2 = dL_dz2.sum(axis=0)
        # Hidden layer gradient (chain rule)
        dL_da1 = dL_dz2 @ self.W2.T
        dL_dz1 = dL_da1 * sigmoid_derivative(self.z1)
        dW1 = X.T @ dL_dz1
        db1 = dL_dz1.sum(axis=0)
        # Update
        self.W1 -= self.lr * dW1
        self.b1 -= self.lr * db1
        self.W2 -= self.lr * dW2
        self.b2 -= self.lr * db2
```

---

## 💡 Key Takeaways

- Gradient descent minimizes loss by following the negative gradient
- **Learning rate** is the most important hyperparameter to tune
- **Mini-batch GD** (batch_size=32–256) is the standard in practice
- Backprop is just the **chain rule** applied recursively
- Modern optimizers (Adam, AdaGrad) adapt learning rates automatically
- Use **gradient clipping** to prevent exploding gradients in RNNs
