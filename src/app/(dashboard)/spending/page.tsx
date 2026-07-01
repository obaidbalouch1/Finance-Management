"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES } from "@/lib/constants"

type Spending = {
  id: string
  description: string
  amount: number
  currency: string
  date: string
  createdAt: string
  updatedAt: string
}

export default function SpendingPage() {
  const [spendings, setSpendings] = useState<Spending[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
  })

  const fetchSpendings = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/spending?month=${selectedMonth}&year=${selectedYear}`
      )
      if (res.ok) {
        const data = await res.json()
        setSpendings(data.spendings)
        setTotal(data.total)
      }
    } catch {
      toast.error("Failed to fetch spendings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpendings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.amount) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/spending/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            amount: parseFloat(formData.amount),
          }),
        })

        if (res.ok) {
          toast.success("Spending updated")
          fetchSpendings()
          handleCloseDialog()
        }
      } else {
        const res = await fetch("/api/spending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            amount: parseFloat(formData.amount),
          }),
        })

        if (res.ok) {
          toast.success("Spending added")
          fetchSpendings()
          handleCloseDialog()
        }
      }
    } catch {
      toast.error("Failed to save spending")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this spending?")) return

    try {
      const res = await fetch(`/api/spending/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Spending deleted")
        fetchSpendings()
      }
    } catch {
      toast.error("Failed to delete spending")
    }
  }

  const handleEdit = (spending: Spending) => {
    setEditingId(spending.id)
    setFormData({
      description: spending.description,
      amount: spending.amount.toString(),
      currency: spending.currency,
      date: new Date(spending.date).toISOString().split("T")[0],
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingId(null)
    setFormData({
      description: "",
      amount: "",
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Simple Spending</h1>
          <p className="text-muted-foreground">
            Quick spending tracker without account selection
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Add Spending
        </Button>
      </div>

      <div className="flex gap-4">
        <Select
          value={selectedMonth.toString()}
          onValueChange={(v) => setSelectedMonth(parseInt(v))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, idx) => (
              <SelectItem key={idx} value={(idx + 1).toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedYear.toString()}
          onValueChange={(v) => setSelectedYear(parseInt(v))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Total</CardTitle>
          <CardDescription>
            {months[selectedMonth - 1]} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ${total.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending History</CardTitle>
          <CardDescription>
            {spendings.length} items this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : spendings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No spendings recorded for this month
            </p>
          ) : (
            <div className="space-y-3">
              {spendings.map((spending) => (
                <div
                  key={spending.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{spending.description}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="size-3" />
                      {new Date(spending.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold">
                      {CURRENCIES.find((c) => c.code === spending.currency)
                        ?.symbol || "$"}
                      {Number(spending.amount).toFixed(2)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(spending)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(spending.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit" : "Add"} Spending
            </DialogTitle>
            <DialogDescription>
              Record a simple spending entry
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What did you spend on?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update" : "Add"} Spending
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
