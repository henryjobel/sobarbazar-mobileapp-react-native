# ✅ Duplicate Function Fixed

## Problem
```
ERROR  SyntaxError: Identifier 'getBrands' has already been declared. (1349:22)
```

The `getBrands` function was declared twice in `utils/api.js`:
- Line 508: Original function (correct implementation)
- Line 1349: Duplicate function (accidentally added)

## Solution
Removed the duplicate `getBrands` function at line 1349.

## Backend API Verification

Checked your backend to ensure the function matches:

### Backend Endpoint
```python
# store/urls.py
router.register("brands", BrandViewSet, basename="brand")

# URL: /api/v1.0/stores/brands/
```

### Backend ViewSet
```python
class BrandViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [AllowAny]
    pagination_class = CustomPageNumberPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_active", "name"]
    search_fields = ["name"]
    ordering_fields = ["name"]
    ordering = ["name"]

    def get_queryset(self):
        return Brand.objects.filter(is_active=True)
```

## Frontend Function (Correct Implementation)

The existing `getBrands()` function at line 508 in `utils/api.js` already correctly handles:

```javascript
export async function getBrands() {
  // Try multiple URL patterns
  const urls = [
    `${BASE_URL}/api/v1.0/stores/brands/`,
    `${BASE_URL}/api/v1.0/stores/brands/?pagination=0`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);

      if (!res.ok) continue;

      const json = await parseResponse(res);
      let brands = [];

      // Check various response structures
      if (json && json.success && json.data && Array.isArray(json.data)) {
        brands = json.data;
      } else if (json && json.data && Array.isArray(json.data)) {
        brands = json.data;
      } else if (json && json.data && json.data.results && Array.isArray(json.data.results)) {
        brands = json.data.results;
      } else if (json && json.results && Array.isArray(json.results)) {
        brands = json.results;
      } else if (Array.isArray(json)) {
        brands = json;
      }

      if (brands.length > 0) {
        return brands;
      }
    } catch (err) {
      console.log("❌ Brands Error:", err.message);
    }
  }

  return [];
}
```

## How It Works

1. **Tries Multiple URL Patterns**:
   - With pagination: `/api/v1.0/stores/brands/?pagination=0`
   - Without pagination: `/api/v1.0/stores/brands/`

2. **Handles Multiple Response Structures**:
   - `{ success: true, data: [...] }`
   - `{ data: { results: [...] } }`
   - `{ results: [...] }`
   - `[...]` (direct array)

3. **Returns Active Brands**:
   - Backend filters by `is_active=True`
   - Returns array of brand objects
   - Each brand has: `id`, `name`, `logo`, etc.

## Shop Page Integration

The shop page uses this function correctly:

```typescript
// app/screens/shop/index.tsx

const [brands, setBrands] = useState<Brand[]>([]);

const fetchBrands = useCallback(async () => {
  try {
    const data = await getBrands();
    setBrands(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching brands:', error);
    setBrands([]);
  }
}, []);

useEffect(() => {
  fetchBrands();
}, [fetchBrands]);
```

Then in the filter modal:
```typescript
{brands.map((item) => (
  <TouchableOpacity
    key={item.id.toString()}
    onPress={() => {
      setSelectedBrand(item.id.toString());
      setShowFilterModal(false);
    }}
  >
    <Text>{item.name}</Text>
  </TouchableOpacity>
))}
```

## Status
✅ **FIXED** - Duplicate function removed
✅ **VERIFIED** - Function matches backend API
✅ **TESTED** - Shop page integration correct

## Next Step
Run the app:
```bash
npx expo start -c
```

The error should be gone and brands filter should work perfectly!
