# Shop Page - Match Frontend Design

## Current Mobile Shop vs Frontend Web Shop

### Frontend Web Shop Has (ShopSection.jsx):

#### Left Sidebar Filters:
1. **Store Info Card** (when filtered by store)
   - Store logo
   - Store name & city
   - Description
   - Contact info (phone, email, address)
   - Social links
   - "Clear Store Filter" button

2. **Category Filter**
   - List of categories
   - Click to filter
   - Highlight selected category

3. **Price Range Filter**
   - Slider for price range
   - Filter button

4. **Rating Filter**
   - 5 star to 1 star options
   - Radio buttons with progress bars
   - Star icons display

5. **Color Filter**
   - Radio buttons for colors
   - Color options with counts

6. **Brand Filter**
   - Radio buttons
   - Brand logos with names
   - Count of products per brand

7. **Advertisement Banner**
   - Image at bottom of sidebar

#### Top Bar:
1. Results count: "Showing 1-20 of 100 results"
2. Search box with submit button
3. Grid/List view toggle (2 buttons)
4. Sort dropdown (Popular, Latest, Price Low-High, Price High-Low)
5. Mobile filter button (shows on small screens)

#### Product Cards:
1. **Discount Badge** (top-left)
2. **New Badge** (top-right if product is new)
3. **Product Image** with hover zoom effect
4. **Store Badge** (bottom-left of image) - store logo + name
5. **Product Title** (2 lines max)
6. **Variant Info** ("Variant: [name]")
7. **Rating** - stars + count "(17k)"
8. **Stock Progress Bar** - "Sold: X/Y"
9. **Price** - with strikethrough if discounted
10. **Add to Cart Button** - full width, with loading state

#### Grid/List Views:
- Grid: 3-4 columns on desktop, 2 on mobile
- List: Full width cards with horizontal layout

#### Pagination:
- Previous/Next arrows
- Page numbers
- Highlighted current page

### What Mobile Needs to Match:

1. Add **price range slider** filter
2. Add **rating filter** with stars and progress bars
3. Add **color filter** with radio options
4. Add **store info card** when filtering by store
5. Add **advertisement banner** in sidebar
6. Show **variant name** under product title
7. Add **stock progress bar** to product cards
8. Add **rating stars** to product cards
9. Add **store badge** on product images
10. Add **discount/new badges** on product cards
11. Improve **pagination** to match frontend style
12. Add proper **grid/list view toggle**
13. Add **sort functionality** (currently placeholder)
14. Make search box match frontend design

## API Integration Notes:

All filters should update URL params and refetch products:
- Category: `supplier_product__subcategories__category=ID`
- Brand: `supplier_product__brand_or_company=ID`  
- Store: `supplier_product__store=ID`
- Search: `search=TERM`
- Page: `page=NUM&page_size=20`

## Mobile-Specific Considerations:

1. **Filters**: Use bottom sheet/modal instead of left sidebar
2. **Layout**: Stack vertically on mobile
3. **Touch targets**: Make buttons larger (min 44x44)
4. **Images**: Optimize for mobile bandwidth
5. **Pagination**: Use load more / infinite scroll as alternative
6. **Store Info**: Show in compact card format

## Implementation Priority:

### High Priority:
1. Fix product cards to show ALL features (store badge, rating, stock, variant)
2. Add pagination controls
3. Implement sort functionality
4. Add rating and stock progress to cards

### Medium Priority:
1. Add price range filter
2. Add rating filter
3. Add color filter  
4. Add store info card
5. Improve grid/list view

### Low Priority:
1. Add advertisement banner
2. Add animations/transitions
3. Optimize images
