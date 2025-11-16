import puppeteer from 'puppeteer';
import Organization from '../models/Organization';

interface BillingRecord {
    id: number;
    billId: string;
    amount: number | string;
    amountInWords: string;
    currency: string;
    paymentType: string;
    billingType: string;
    remark: string | null;
    createdBy: { id: number; fullName: string } | null;
    updatedBy: { id: number; fullName: string } | null;
    updatedRemark: string | null;
    createdAt: string;
    updatedAt: string;
    createdAtBs?: string | null;
    user: {
        id: number;
        fullName: string;
        username: string;
        role: string;
        guardianName: string;
        guardianContact: string;
        status: string;
    };
    enrollments: Array<{
        id: number;
        department: { id: number; name: string } | null;
        course: { id: number; name: string } | null;
        class: { id: number; name: string } | null;
        section: { id: number; name: string } | null;
        enrollmentDate: string;
        totalFees: string;
        discount: string;
        netFees: string;
        isActive: boolean;
    }>;
}

class PdfService {
    /**
     * Get organization information from database or fallback to .env
     */
    private static async getOrganizationInfo() {
        try {
            // Try to get the first organization record from database
            const organization = await Organization.findOne({
                order: [['id', 'ASC']]
            });

            if (organization) {
                const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
                return {
                    name: organization.organizationName,
                    address: organization.address,
                    phone: organization.phone,
                    email: organization.email,
                    website: organization.website || process.env.ORG_WEBSITE || 'N/A',
                    registrationNumber: organization.registrationNumber || process.env.ORG_REG_NO || 'N/A',
                    panNumber: organization.panNumber || process.env.ORG_PAN || 'N/A',
                    logo: organization.logo ? `${serverUrl}${organization.logo}` : null,
                    logoLabel: process.env.LOGO_LABEL || 'School Logo'
                };
            }
        } catch (error) {
            console.error('Error fetching organization from database:', error);
        }

        // Fallback to .env variables
        return {
            name: process.env.ORG_NAME || 'School Name',
            address: process.env.ORG_ADDRESS || 'School Address',
            phone: process.env.ORG_PHONE || 'N/A',
            email: process.env.ORG_EMAIL || 'N/A',
            website: process.env.ORG_WEBSITE || 'N/A',
            registrationNumber: process.env.ORG_REG_NO || 'N/A',
            panNumber: process.env.ORG_PAN || 'N/A',
            logo: null,
            logoLabel: process.env.LOGO_LABEL || 'School Logo'
        };
    }

    /**
     * Generate HTML content for the invoice
     */
    private static async generateInvoiceHTML(billingRecord: BillingRecord): Promise<string> {
        const enrollment = billingRecord.enrollments?.[0] || null;

        // Get organization info from database or .env
        const org = await this.getOrganizationInfo();

        const toSentenceCase = (str: string) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        };

        // Safely format amount from number|string
        const toNumber = (v: unknown): number => {
            const n = typeof v === 'number' ? v : parseFloat(String(v || 0));
            return isNaN(n) ? 0 : n;
        };
        const amountNum = toNumber(billingRecord.amount);
        const amountFixed = amountNum.toFixed(2);

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${billingRecord.billId}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: white;
            font-size: 12pt;
            line-height: 1.3;
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
            color: #000000;
        }
        
        .invoice-container {
            width: 210mm;
            min-height: 297mm;
            background: white;
            padding: 15mm;
        }
        
        /* Header Styles */
        .header {
            margin-bottom: 20px;
            border-bottom: 2px solid #000000;
            padding-bottom: 15px;
        }

        .header-main {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .logo-area {
            width: 80px;
            height: 80px;
            border: 1px solid #cccccc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8pt;
            text-align: center;
        }

        .logo-area img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .school-text {
            flex: 1;
            text-align: center;
        }
        
        .school-name {
            font-size: 20pt;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        .school-details {
            font-size: 11pt;
            margin-bottom: 5px;
            line-height: 1.4;
        }

        .invoice-box {
            text-align: right;
        }

        .invoice-title {
            font-size: 18pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .invoice-meta {
            margin-top: 4px;
            font-size: 10pt;
        }
        
        /* Student Information */
        .student-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 30px;
            margin-bottom: 20px;
            font-size: 11pt;
        }
        
        .info-item {
            display: flex;
            align-items: center;
            gap: 6px; /* just a small gap between label and value */
        }
        
        .label {
            font-weight: bold;
            min-width: 120px;
        }
        
        .value {
            /* No flex:1 and no text-align:right => no justify-between look */
        }
        
        /* Table Styles */
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 11pt;
        }
        
        .payment-table th,
        .payment-table td {
            border: 1px solid #000000;
            padding: 8px 12px;
        }

        /* Makes the row have a minimum height appearance */
        .payment-table td {
            height: 28px;
        }
        
        .payment-table th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: left;
        }
        
        .amount-column {
            text-align: right;
            width: 120px;
        }
        .billing-item-row{
            height: 30px;
        }
        
        .total-row {
            font-weight: bold;
        }
        
        
        /* Payment Details */
        .payment-details {
            margin-bottom: 15px;
            font-size: 11pt;
        }
        
        .payment-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 30px;
            margin-bottom: 10px;
        }

        /* Explicitly keep flex+gap for these rows */
        .payment-info .info-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .amount-in-words {
            font-style: italic;
            margin-top: 10px;
            padding: 8px 0;
            border-top: 1px dashed #000000;
            border-bottom: 1px dashed #000000;
        }
        
        /* Footer Styles */
        .footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
            padding-top: 20px;
        }
        
        .signature-area {
            text-align: center;
            margin-top: 20px;
        }
        
        .signature-line {
            border-top: 1px solid #000000;
            width: 200px;
            margin: 40px auto 5px auto;
        }
        
        .stamp-area {
            text-align: center;
        }
        
        .print-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #cccccc;
        }
        
        .print-footer p {
            font-size: 9pt;
            color: #666666;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="header-main">
                <div class="logo-area">
                    ${org.logo
                ? `<img src="${org.logo}" alt="${org.logoLabel || 'School Logo'}" />`
                : `<span>${org.logoLabel || 'School Logo'}</span>`
            }
                </div>

                <div class="school-text">
                    <div class="school-name">${org.name}</div>
                    <div class="school-details">
                        ${org.address}<br>
                        Phone: ${org.phone} | Email: ${org.email}<br>
                        Reg. No: ${org.registrationNumber} | PAN: ${org.panNumber}
                    </div>
                </div>

                <div class="invoice-box">
                    <div class="invoice-title">Invoice</div>
                </div>
            </div>
        </div>

        <!-- Student Information -->
        <div class="student-info">
            <div class="info-item">
                <span class="label">Student Name:</span>
                <span class="value">${billingRecord.user.fullName}</span>
            </div>
            <div class="info-item">
                <span class="label">Student Code:</span>
                <span class="value">${billingRecord.user.username}</span>
            </div>
            <div class="info-item">
                <span class="label">Class:</span>
                <span class="value">${enrollment?.class?.name || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="label">Section:</span>
                <span class="value">${enrollment?.section?.name || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="label">Guardian:</span>
                <span class="value">${billingRecord.user.guardianName}</span>
            </div>
            <div class="info-item">
                <span class="label">Contact:</span>
                <span class="value">${billingRecord.user.guardianContact}</span>
            </div>
            <div class="info-item">
                <span class="label">Invoice ID:</span>
                <span class="value">${billingRecord.billId}</span>
            </div>
            <div class="info-item">
                <span class="label">Date:</span>
                <span class="value">${billingRecord.createdAtBs || new Date(billingRecord.createdAt).toLocaleDateString()}</span>
            </div>
        </div>

        <!-- Payment Table -->
        <table class="payment-table">
            <thead>
                <tr>
                    <th style="width: 40px;">S.N.</th>
                    <th>Description</th>
                    <th class="amount-column">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr class="billing-item-row">
                    <td>1</td>
                    <td>${billingRecord.remark || 'Payment'}</td>
                    <td class="amount-column">${amountFixed}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2" style="text-align: right;">Received Amount</td>
                    <td class="amount-column">${billingRecord.currency.toUpperCase()} ${amountFixed}</td>
                </tr>
            </tbody>
        </table>

        <!-- Payment Details -->
        <div class="payment-details">
            <div class="payment-info">
                <div class="info-item">
                    <span class="label">Billing Type:</span>
                    <span class="value">${toSentenceCase(billingRecord.billingType)}</span>
                </div>
                <div class="info-item">
                    <span class="label">Payment Type:</span>
                    <span class="value">${toSentenceCase(billingRecord.paymentType.replace(/_/g, ' '))}</span>
                </div>
            </div>
            
            <div class="amount-in-words">
                <strong>In words:</strong> ${billingRecord.amountInWords}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="signature-area">
                <div class="signature-line"></div>
                <div style="font-weight: normal; margin-bottom: 5px;">School Stamp</div>
            </div>
            
            <div class="signature-area">
                <div class="signature-line"></div>
                <div style="font-weight: normal; margin-bottom: 5px;">Received By</div>
                <div style="margin-top: 5px; font-weight: normal;">${billingRecord.createdBy?.fullName || 'System Administrator'}</div>
            </div>
        </div>

        <!-- Print Footer -->
        <div class="print-footer">
            <p>Printed Time: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
    `;
    }


    /**
     * Generate PDF from billing record
     */
    static async generateBillingPDF(billingRecord: BillingRecord): Promise<Buffer> {
        let browser = null;

        try {
            console.log('Starting PDF generation...');

            // Launch browser with more options
            browser = await puppeteer.launch({
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            });

            console.log('Browser launched successfully');
            const page = await browser.newPage();

            // Generate HTML content
            console.log('Generating HTML content...');
            const htmlContent = await this.generateInvoiceHTML(billingRecord);

            console.log('Setting HTML content...');
            // Set content
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            });

            console.log('Generating PDF...');
            // Generate PDF with exact A4 size and margins
            const pdfBuffer = await page.pdf({
                width: '210mm',
                height: '297mm',
                printBackground: true,
                margin: {
                    top: '0mm',
                    right: '0mm',
                    bottom: '0mm',
                    left: '0mm'
                },
                preferCSSPageSize: true
            });

            console.log('PDF generated successfully');
            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            console.error('Error stack:', (error as Error).stack);
            throw new Error('Failed to generate PDF');
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

export default PdfService;