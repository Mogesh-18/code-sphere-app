# PHP Professional Developer Handbook

## 1. Introduction

### What PHP Is
PHP is a server-side scripting language powering ~77% of all websites. Modern PHP 8.3 supports union types, enums, fibers, and JIT compilation.

## 2. Core Fundamentals

### Strict Types

```php
<?php
declare(strict_types=1);

function calculateDiscount(float $price, float $rate): float {
    return $price * (1 - $rate);
}
```

### Variables and Types

```php
$name    = 'Alice';
$age     = 30;
$price   = 99.99;
$active  = true;
$nothing = null;

// Null coalescing
$name = $_GET['name'] ?? 'Guest';

// Nullsafe operator
$city = $user?->getAddress()?->getCity();
```

### Arrays

```php
$products = [
    ['id' => 1, 'name' => 'Laptop', 'price' => 45000],
    ['id' => 2, 'name' => 'Monitor', 'price' => 18000],
];

$names   = array_column($products, 'name');
$sorted  = usort($products, fn($a, $b) => $a['price'] - $b['price']);
$inStock = array_filter($products, fn($p) => $p['price'] > 20000);
```

## 3. OOP

### Classes

```php
<?php
class Product {
    public function __construct(
        private readonly int    $id,
        private string          $name,
        private float           $price,
    ) {}

    public function getId(): int    { return $this->id; }
    public function getName(): string { return $this->name; }

    public function applyDiscount(float $rate): self {
        $this->price = round($this->price * (1 - $rate), 2);
        return $this;
    }

    public function toArray(): array {
        return ['id' => $this->id, 'name' => $this->name, 'price' => $this->price];
    }
}
```

### Enums (PHP 8.1+)

```php
enum OrderStatus: string {
    case Pending   = 'pending';
    case Confirmed = 'confirmed';
    case Shipped   = 'shipped';

    public function label(): string {
        return match($this) {
            self::Pending   => 'Pending Review',
            self::Confirmed => 'Order Confirmed',
            self::Shipped   => 'Shipped',
        };
    }
}

$status = OrderStatus::from('pending');
echo $status->label(); // "Pending Review"
```

## 4. Database (PDO)

```php
$stmt = $db->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute(['id' => $id]);
$user = $stmt->fetch();
```

| Method | Purpose |
|--------|---------|
| `prepare()` | Compiles SQL with placeholders |
| `execute()` | Binds values and runs query |
| `fetch()` | Gets one row |
| `fetchAll()` | Gets all rows |

## 5. Security

### Passwords

```php
// Hashing
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Verification
if (!password_verify($input, $hash)) {
    throw new AuthException('Invalid credentials');
}
```

### XSS Prevention

```php
// Escape all user output
echo htmlspecialchars($userInput, ENT_QUOTES | ENT_HTML5, 'UTF-8');

// Helper function
function e(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
```

## 6. Error Handling

```php
<?php
class ValidationException extends RuntimeException {
    public function __construct(private array $errors) {
        parent::__construct('Validation failed');
    }
    public function getErrors(): array { return $this->errors; }
}

function processOrder(array $data): array {
    try {
        $validated = validate($data);
        $order = createOrder($validated);
        return ['success' => true, 'orderId' => $order->getId()];
    } catch (ValidationException $e) {
        return ['success' => false, 'errors' => $e->getErrors()];
    } catch (\Throwable $e) {
        logError($e);
        throw $e;
    }
}
```
