import { prisma } from './prisma';

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: Record<string, number>;
  invoiceCount: number;
}

export interface ProjectMetrics {
  totalProjects: number;
  statusCounts: Record<string, number>;
  totalBudget: number;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
}

export interface InvoiceMetrics {
  totalInvoices: number;
  statusCounts: Record<string, number>;
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
}

export interface MaterialCostMetrics {
  totalMaterialCost: number;
  totalLaborCost: number;
  totalCost: number;
  materialCosts: Array<{ materialId: string; name: string; cost: number }>;
}

export async function calculateRevenueMetrics(
  companyId: string,
  startDate?: Date,
  endDate?: Date
): Promise<RevenueMetrics> {
  const where: any = {
    companyId,
    status: 'Paid',
  };

  if (startDate) {
    where.paidDate = { ...where.paidDate, gte: startDate };
  }
  if (endDate) {
    where.paidDate = { ...where.paidDate, lte: endDate };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      payments: true,
    },
  });

  const totalRevenue = invoices.reduce((sum, invoice) => {
    const paid = invoice.payments.reduce((pSum, p) => pSum + p.amount.toNumber(), 0);
    return sum + paid;
  }, 0);

  const monthlyRevenue: Record<string, number> = {};
  invoices.forEach((invoice) => {
    invoice.payments.forEach((payment) => {
      const month = payment.paidAt.toISOString().substring(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + payment.amount.toNumber();
    });
  });

  return {
    totalRevenue,
    monthlyRevenue,
    invoiceCount: invoices.length,
  };
}

export async function calculateProjectMetrics(companyId: string): Promise<ProjectMetrics> {
  const projects = await prisma.project.findMany({
    where: {
      companyId,
    },
    include: {
      invoices: {
        include: {
          payments: true,
        },
      },
      materialUsages: {
        include: {
          material: true,
        },
      },
    },
  });

  const statusCounts: Record<string, number> = {};
  let totalBudget = 0;
  let totalRevenue = 0;
  let totalCosts = 0;

  projects.forEach((project) => {
    statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;

    if (project.budget) {
      totalBudget += project.budget.toNumber();
    }

    const projectRevenue = project.invoices.reduce((sum, inv) => {
      return sum + inv.payments.reduce((pSum, p) => pSum + p.amount.toNumber(), 0);
    }, 0);
    totalRevenue += projectRevenue;

    const projectCosts = project.materialUsages.reduce((sum, usage) => {
      return sum + (usage.quantity.toNumber() * usage.unitPrice.toNumber());
    }, 0);
    totalCosts += projectCosts;
  });

  return {
    totalProjects: projects.length,
    statusCounts,
    totalBudget,
    totalRevenue,
    totalCosts,
    profit: totalRevenue - totalCosts,
  };
}

export async function calculateInvoiceMetrics(companyId: string): Promise<InvoiceMetrics> {
  const invoices = await prisma.invoice.findMany({
    where: {
      companyId,
    },
    include: {
      payments: true,
    },
  });

  const statusCounts: Record<string, number> = {};
  let totalAmount = 0;
  let totalPaid = 0;
  let totalUnpaid = 0;

  invoices.forEach((invoice) => {
    statusCounts[invoice.status] = (statusCounts[invoice.status] || 0) + 1;
    totalAmount += invoice.total.toNumber();

    const paid = invoice.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
    totalPaid += paid;
    totalUnpaid += invoice.total.toNumber() - paid;
  });

  return {
    totalInvoices: invoices.length,
    statusCounts,
    totalAmount,
    totalPaid,
    totalUnpaid,
  };
}

export async function calculateMaterialCostMetrics(companyId: string): Promise<MaterialCostMetrics> {
  const materials = await prisma.material.findMany({
    where: {
      companyId,
    },
    include: {
      usages: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  let totalMaterialCost = 0;
  const materialCosts: Array<{ materialId: string; name: string; cost: number }> = [];

  materials.forEach((material) => {
    const cost = material.usages.reduce((sum, usage) => {
      return sum + (usage.quantity.toNumber() * usage.unitPrice.toNumber());
    }, 0);

    totalMaterialCost += cost;
    materialCosts.push({
      materialId: material.id,
      name: material.name,
      cost,
    });
  });

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId,
    },
    include: {
      lineItems: true,
    },
  });

  let totalLaborCost = 0;
  invoices.forEach((invoice) => {
    invoice.lineItems.forEach((item) => {
      if (item.type === 'Labor') {
        totalLaborCost += item.total.toNumber();
      }
    });
  });

  return {
    totalMaterialCost,
    totalLaborCost,
    totalCost: totalMaterialCost + totalLaborCost,
    materialCosts: materialCosts.sort((a, b) => b.cost - a.cost).slice(0, 10),
  };
}

