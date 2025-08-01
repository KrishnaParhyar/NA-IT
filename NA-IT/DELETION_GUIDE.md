# 🗑️ Deletion Guide - NA Inventory System

## Why Can't I Delete Items/Categories?

The inventory system has **foreign key constraints** to maintain data integrity. This means you cannot delete items or categories that are being used by other parts of the system.

## 📦 Item Deletion Issues

### Items Cannot Be Deleted If They Have:

1. **📋 Issuance History** - Items that have been issued to employees
2. **📄 Associated Documents** - Items with uploaded documents
3. **🔗 Composite Items** - Items that are part of composite systems (like desktop parts)

### Error Messages You'll See:

- `Cannot delete item. It has issuance history. Please return all issued items first.`
- `Cannot delete item. It has associated documents. Please remove documents first.`
- `Cannot delete item. It is part of composite items. Please remove from composite items first.`

### How to Fix Item Deletion Issues:

#### For Issuance History:
1. Go to **Issuance** page
2. Find the item and mark it as "Returned"
3. Or delete the issuance logs (if appropriate)

#### For Documents:
1. Go to **Items List** page
2. Click "View All Documents" for the item
3. Delete the documents first
4. Then delete the item

#### For Composite Items:
1. Go to the composite item management
2. Remove the item from the composite system
3. Then delete the individual item

## 📂 Category Deletion Issues

### Categories Cannot Be Deleted If They Have:

1. **📦 Items Using Them** - Any items assigned to that category

### Error Messages You'll See:

- `Cannot delete category. It is being used by items in the inventory.`

### How to Fix Category Deletion Issues:

1. **Option 1: Delete All Items in Category**
   - Delete all items that use this category first
   - Then delete the category

2. **Option 2: Reassign Items**
   - Create a new category
   - Move all items to the new category
   - Then delete the old category

## 🔧 Utility Scripts

### Check Item Dependencies:
```bash
cd NA-IT/backend
node scripts/check-item-dependencies.js <item_id>
```

### Check Category Dependencies:
```bash
cd NA-IT/backend
node scripts/check-category-dependencies.js <category_id>
```

## 💡 Best Practices

1. **Always check dependencies before deletion**
2. **Use the utility scripts to understand what's blocking deletion**
3. **Consider archiving instead of deleting** for important historical data
4. **Document why items are being deleted** for audit purposes

## 🚨 Important Notes

- **Data integrity is protected** - This prevents accidental data loss
- **Audit trails are maintained** - Issuance history helps track item usage
- **Composite items stay intact** - Prevents breaking system configurations

## 📞 Need Help?

If you're still having issues with deletion:

1. Use the utility scripts to check dependencies
2. Follow the specific error messages
3. Contact your system administrator if you need to force delete items

---

**Remember**: The deletion restrictions are there to protect your data integrity. It's better to be safe than sorry! 🛡️ 