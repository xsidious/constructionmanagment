'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Material {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel?: number;
  supplier?: {
    id: string;
    name: string;
  };
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const isLowStock = (material: Material) => {
    if (!material.minStockLevel) return false;
    return material.stockQuantity <= material.minStockLevel;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Materials</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <Button asChild>
          <Link href="/materials/new">
            <Plus className="mr-2 h-4 w-4" />
            New Material
          </Link>
        </Button>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No materials yet</p>
            <Button asChild className="mt-4">
              <Link href="/materials/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Material
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {isLowStock(material) && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      {material.name}
                    </div>
                  </TableCell>
                  <TableCell>{material.sku || '-'}</TableCell>
                  <TableCell>{material.category || '-'}</TableCell>
                  <TableCell>{formatCurrency(material.unitPrice)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {material.stockQuantity}
                      {isLowStock(material) && (
                        <span className="text-xs text-destructive">(Low Stock)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{material.supplier?.name || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/materials/${material.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

