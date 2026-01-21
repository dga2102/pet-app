import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader, AlertCircle, Check } from "lucide-react";

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "food",
    quantity: "",
    unit: "",
    priority: "medium",
    petId: "",
    estimatedCost: "",
    supplier: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, petsRes] = await Promise.all([
        fetch("/api/shopping"),
        fetch("/api/pets"),
      ]);

      const itemsData = await itemsRes.json();
      const petsData = await petsRes.json();

      setItems(Array.isArray(itemsData) ? itemsData : []);
      setPets(Array.isArray(petsData) ? petsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setItems([]);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingItem) {
        response = await fetch(`/api/shopping/${editingItem._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/shopping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        fetchData();
        setShowForm(false);
        setEditingItem(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      category: "food",
      quantity: "",
      unit: "",
      priority: "medium",
      petId: "",
      estimatedCost: "",
      supplier: "",
      notes: "",
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity || "",
      unit: item.unit || "",
      priority: item.priority,
      petId: item.petId?._id || item.petId || "",
      estimatedCost: item.estimatedCost || "",
      supplier: item.supplier || "",
      notes: item.notes || "",
    });
    setShowForm(true);
  };

  const handleToggleComplete = async (item) => {
    try {
      const response = await fetch(`/api/shopping/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          isCompleted: !item.isCompleted,
          completedAt: !item.isCompleted ? new Date() : null,
        }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDelete = async (itemId) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(`/api/shopping/${itemId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const getPetName = (petId) => {
    if (!petId) return "General";
    const pet = pets.find((p) => p._id === petId);
    return pet?.name || "Unknown";
  };

  const incompleteItems = items.filter((item) => !item.isCompleted);
  const completedItems = items.filter((item) => item.isCompleted);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shopping List</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">
            {editingItem ? "Edit Item" : "Add Item to List"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Dog Food"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="food">Food</option>
                  <option value="treats">Treats</option>
                  <option value="supplies">Supplies</option>
                  <option value="toys">Toys</option>
                  <option value="medication">Medication</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., bags"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pet (optional)
                </label>
                <select
                  name="petId"
                  value={formData.petId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">General Supplies</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 25.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Amazon"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Add any notes..."
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {editingItem ? "Update Item" : "Add Item"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {incompleteItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">
              To Buy ({incompleteItems.length})
            </h3>
          </div>
          <div className="divide-y">
            {incompleteItems.map((item) => (
              <div
                key={item._id}
                className="px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleComplete(item)}
                        className="w-5 h-5 text-blue-500 rounded cursor-pointer"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.itemName}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <span className="capitalize">{item.category}</span>
                          {item.quantity && (
                            <span>
                              Qty: {item.quantity} {item.unit}
                            </span>
                          )}
                          <span className="text-gray-500">
                            For: {getPetName(item.petId)}
                          </span>
                        </div>
                        {(item.estimatedCost ||
                          item.supplier ||
                          item.notes) && (
                          <div className="text-xs text-gray-500 mt-2">
                            {item.estimatedCost && (
                              <span>${item.estimatedCost} • </span>
                            )}
                            {item.supplier && <span>{item.supplier}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {item.priority === "high" && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                        Urgent
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 hover:text-blue-700 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Completed ({completedItems.length})
            </h3>
          </div>
          <div className="divide-y">
            {completedItems.map((item) => (
              <div
                key={item._id}
                className="px-6 py-4 hover:bg-gray-50 transition opacity-60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="line-through text-gray-600">
                          {item.itemName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className="text-blue-500 hover:text-blue-700 transition text-sm"
                  >
                    Undo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500 mb-4">No items in your shopping list</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Plus size={20} />
            Add First Item
          </button>
        </div>
      )}
    </div>
  );
}
