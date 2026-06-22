# Laravel Professional Developer Handbook

## 1. Introduction

### What Laravel Is
Laravel is the most popular PHP framework, providing routing, authentication, Eloquent ORM, queues, and more.

## 2. Core Concepts

### Directory Structure

```
app/
├── Http/Controllers/
├── Http/Requests/     ← Validation
├── Http/Resources/    ← API responses
├── Models/
├── Services/          ← Business logic
routes/
├── web.php
├── api.php
database/migrations/
```

### Routing

```php
// Resource routes
Route::apiResource('products', ProductController::class);

// Grouped routes
Route::prefix('api/v1')
     ->middleware(['auth:sanctum'])
     ->group(function() {
         Route::apiResource('orders', OrderController::class);
     });

// Route model binding
Route::get('/products/{product:slug}', [ProductController::class, 'show']);
```

## 3. Eloquent ORM

### Model Definition

```php
<?php
class Product extends Model {
    use SoftDeletes;

    protected $fillable = ['name', 'slug', 'price', 'active'];
    protected $casts = ['price' => 'decimal:2', 'active' => 'boolean'];

    // Relationships
    public function category(): BelongsTo {
        return $this->belongsTo(Category::class);
    }

    // Scopes
    public function scopeActive(Builder $query): Builder {
        return $query->where('active', true);
    }
}
```

### Querying

```php
// Eager loading prevents N+1
$products = Product::with(['category', 'tags'])
    ->active()
    ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
    ->paginate(20);
```

## 4. Form Requests

```php
class StoreProductRequest extends FormRequest {
    public function authorize(): bool {
        return $this->user()->can('create', Product::class);
    }

    public function rules(): array {
        return [
            'name'  => ['required', 'string', 'max:200'],
            'price' => ['required', 'numeric', 'min:0'],
            'slug'  => ['required', 'unique:products,slug'],
        ];
    }
}

// Controller uses it
public function store(StoreProductRequest $request): ProductResource {
    $product = $this->service->create($request->validated());
    return new ProductResource($product);
}
```

## 5. API Resources

```php
class ProductResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id'       => $this->id,
            'name'     => $this->name,
            'price'    => (float) $this->price,
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
```

## 6. Queues

```php
class SendOrderConfirmation implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $tries   = 3;
    public int $timeout = 60;

    public function __construct(private readonly Order $order) {}

    public function handle(MailService $mail): void {
        $mail->sendConfirmation($this->order->user, $this->order);
    }

    public function failed(\Throwable $e): void {
        Log::error('Mail failed', ['order' => $this->order->id, 'error' => $e->getMessage()]);
    }
}

// Dispatch
SendOrderConfirmation::dispatch($order)->onQueue('emails');
```

## 7. Common Mistakes

### N+1 Query Problem

```php
// Wrong — 1 + N queries
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->user->name; // Query per iteration!
}

// Correct — 2 queries total
$orders = Order::with('user')->paginate(20);
```

### Mass Assignment

```php
// Wrong — any field can be set
$user = User::create($request->all());

// Correct — only validated fields
$user = User::create($request->validated());
// And define $fillable on the model
```
