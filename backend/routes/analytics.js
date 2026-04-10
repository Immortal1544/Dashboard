import express from 'express';
import {
	getBusinessOverviewAnalytics,
	getCustomerMonthlyAnalytics,
	getCustomerSummaryAnalytics,
	getDashboardAnalytics,
	getCompanySalesAnalytics,
	getInventoryAnalytics,
	getMonthlySalesAnalytics,
	getTopCustomersAnalytics,
	getYearlySalesAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', getDashboardAnalytics);
router.get('/business-overview', getBusinessOverviewAnalytics);
router.get('/inventory', getInventoryAnalytics);
router.get('/monthly-sales', getMonthlySalesAnalytics);
router.get('/yearly-sales', getYearlySalesAnalytics);
router.get('/company-sales', getCompanySalesAnalytics);
router.get('/customer-summary', getCustomerSummaryAnalytics);
router.get('/customer-monthly', getCustomerMonthlyAnalytics);
router.get('/top-customers', getTopCustomersAnalytics);

export default router;
