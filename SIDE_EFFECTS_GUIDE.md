# When to Use Side Effects in Zustand Actions

## ✅ **GOOD: Use Side Effects For**

### 1. **Synchronous Derived State Updates**
Update multiple related fields atomically:

```typescript
setAutocompleteInput: (input: string) =>
  set({ 
    autocompleteInput: input, 
    shouldShowSuggestions: true 
  }),
```

### 2. **Local Storage Persistence**
```typescript
setRadius: (radius: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mapRadius', radius.toString());
  }
  set({ radius });
}
```

### 3. **Browser API Interactions**
```typescript
setTheme: (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme);
  set({ theme });
}
```

### 4. **Non-blocking Analytics/Logging**
```typescript
setSearchLocation: (location: Coords) => {
  // Non-blocking analytics
  if (typeof window !== 'undefined') {
    window.gtag?.('event', 'location_changed', { location });
  }
  set({ searchLocation: location });
}
```

### 5. **Validation & Normalization**
```typescript
setRadius: (radius: number) => {
  const normalized = Math.max(100, Math.min(5000, radius));
  set({ radius: normalized });
}
```

### 6. **Using `get()` for Conditional Logic**
```typescript
setActiveMarker: (id: string | undefined) => {
  const { activeMarker } = get();
  if (activeMarker === id) {
    // Don't update if same marker
    return;
  }
  set({ activeMarker: id });
}
```

---

## ❌ **BAD: Don't Use Side Effects For**

### 1. **API Calls / Async Data Fetching**
❌ **Bad:**
```typescript
setSearchQuery: (query: string) => {
  fetchAddressSuggestions(query).then(suggestions => {
    setSearchSuggestions(suggestions); // ❌ Don't do this
  });
}
```

✅ **Good:** Use React Query hooks instead:
```typescript
// In hook
const query = useQuery({
  queryKey: ["autocomplete", input],
  queryFn: () => fetchAddressSuggestions(input),
});
```

### 2. **Complex Async Operations**
❌ **Bad:**
```typescript
setSearchLocation: async (location: Coords) => {
  const places = await fetchNearbyPlaces(location); // ❌ Don't do this
  setSelectedPlaceIds(places.map(p => p.id));
}
```

✅ **Good:** Handle in component/hook:
```typescript
// In hook
const { data: places } = useQuery({
  queryKey: ["nearbyPlaces", location],
  queryFn: () => fetchNearbyPlaces(location),
});

// Derive selectedPlaceIds from places if needed
```

### 3. **React Hooks**
❌ **Bad:**
```typescript
setAutocompleteInput: (input: string) => {
  const suggestions = useQuery(...); // ❌ Can't use hooks here
}
```

### 4. **Side Effects That Should Be in useEffect**
❌ **Bad:**
```typescript
setSearchSuggestions: (suggestions: AutocompleteResult[]) => {
  if (suggestions.length === 0) {
    setShouldShowSuggestions(false); // ❌ Better in useEffect
  }
  set({ searchSuggestions: suggestions });
}
```

✅ **Good:** Handle in component:
```typescript
useEffect(() => {
  if (suggestions.length === 0 && input.trim().length === 0) {
    setShouldShowSuggestions(false);
  }
}, [suggestions, input]);
```

---

## 🤔 **BORDERLINE CASES**

### Case: Updating Zustand from React Query Results

**Current pattern in `use-nearby-places.tsx`:**
```typescript
queryFn: async () => {
  const places = await fetchNearbyPlaces(...);
  setSelectedPlaceIds(places.map((p) => p.id)); // ⚠️ Side effect in queryFn
  return places;
}
```

**Consider:**
- ✅ **OK if:** `selectedPlaceIds` is used in multiple places and needs to persist
- ❌ **Better if:** Derive `selectedPlaceIds` from React Query data when needed:
  ```typescript
  // In component
  const { data: places = [] } = useNearbyPlaces();
  const selectedPlaceIds = places.map(p => p.id);
  ```

**Recommendation:** If `selectedPlaceIds` is only used for filtering/display, derive it. If it represents user selections that persist independently, keep it in Zustand but update via `useEffect`:

```typescript
useEffect(() => {
  if (places.length > 0) {
    setSelectedPlaceIds(places.map(p => p.id));
  }
}, [places]);
```

---

## 📋 **Decision Tree**

```
Is it synchronous? 
├─ Yes → Is it updating related state?
│   ├─ Yes → ✅ Use side effect in Zustand
│   └─ No → Is it browser API (localStorage, cookies, etc.)?
│       ├─ Yes → ✅ Use side effect in Zustand
│       └─ No → Is it validation/normalization?
│           ├─ Yes → ✅ Use side effect in Zustand
│           └─ No → ⚠️ Consider if it belongs in Zustand
│
└─ No (async) → Is it an API call?
    ├─ Yes → ❌ Use React Query hook instead
    └─ No → Is it a complex async operation?
        ├─ Yes → ❌ Handle in component/hook
        └─ No → ⚠️ Consider carefully
```

---

## 🎯 **Key Principles**

1. **Zustand = UI State + Synchronous Side Effects**
2. **React Query = Server State + Async Operations**
3. **Keep actions pure when possible** - easier to test and reason about
4. **Side effects should be predictable** - no hidden async behavior
5. **When in doubt, keep it simple** - prefer explicit `useEffect` over hidden side effects


