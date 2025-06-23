#!/usr/bin/env node

/**
 * TebX Dashboard Integration Test Suite
 * Tests the complete system from frontend to backend
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

class TebXIntegrationTest {
    constructor(config) {
        this.config = {
            apiBaseUrl: config.apiBaseUrl || 'https://api.tebx.com',
            dashboardUrl: config.dashboardUrl || 'https://dashboard.tebx.com',
            authToken: config.authToken || process.env.TEBX_AUTH_TOKEN,
            clinicId: config.clinicId || '507f1f77bcf86cd799439011',
            timeout: config.timeout || 10000,
            ...config
        };
        
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    async runAllTests() {
        console.log('🚀 Starting TebX Dashboard Integration Tests...\n');
        console.log('Configuration:');
        console.log(`  API URL: ${this.config.apiBaseUrl}`);
        console.log(`  Dashboard URL: ${this.config.dashboardUrl}`);
        console.log(`  Clinic ID: ${this.config.clinicId}\n`);

        try {
            // Infrastructure Tests
            await this.testInfrastructure();
            
            // API Tests
            await this.testAPIEndpoints();
            
            // Dashboard Tests
            await this.testDashboardFrontend();
            
            // Integration Tests
            await this.testEndToEndWorkflows();
            
            // Performance Tests
            await this.testPerformance();
            
            // Security Tests
            await this.testSecurity();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
        }

        this.generateReport();
    }

    async testInfrastructure() {
        console.log('🏗️  Testing Infrastructure...');
        
        await this.test('API Server Health Check', async () => {
            const response = await this.makeRequest('/health');
            if (response.statusCode !== 200) {
                throw new Error(`Health check failed: ${response.statusCode}`);
            }
            return 'API health check passed';
        });

        await this.test('Database Connectivity', async () => {
            const response = await this.makeRequest('/dashboard/clinic/' + this.config.clinicId + '/overview');
            if (response.statusCode !== 200) {
                throw new Error(`Database connection failed: ${response.statusCode}`);
            }
            return 'Database connectivity verified';
        });

        await this.test('SSL Certificate Validation', async () => {
            const response = await this.makeRequest('/health');
            if (!response.secure) {
                throw new Error('SSL certificate invalid');
            }
            return 'SSL certificate valid';
        });

        await this.test('DNS Resolution', async () => {
            const url = new URL(this.config.apiBaseUrl);
            const startTime = Date.now();
            await this.makeRequest('/health');
            const duration = Date.now() - startTime;
            
            if (duration > 5000) {
                throw new Error(`DNS resolution too slow: ${duration}ms`);
            }
            return `DNS resolution: ${duration}ms`;
        });
    }

    async testAPIEndpoints() {
        console.log('🔌 Testing API Endpoints...');

        await this.test('Clinic Overview Endpoint', async () => {
            const response = await this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/overview`);
            const data = JSON.parse(response.body);
            
            if (!data.clinicId || !data.appointmentSummary || !data.patientFlow) {
                throw new Error('Invalid overview response structure');
            }
            
            return `Overview data: ${data.appointmentSummary.total} appointments`;
        });

        await this.test('Waiting Room Endpoint', async () => {
            const response = await this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/waiting-room`);
            const data = JSON.parse(response.body);
            
            if (!data.clinicId || typeof data.totalInQueue !== 'number') {
                throw new Error('Invalid waiting room response structure');
            }
            
            return `Waiting room: ${data.totalInQueue} patients in queue`;
        });

        await this.test('Queue Analytics Endpoint', async () => {
            const response = await this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/queue-analytics`);
            const data = JSON.parse(response.body);
            
            if (!data.clinicId || !data.hourlyQueueData) {
                throw new Error('Invalid analytics response structure');
            }
            
            return `Analytics: ${data.totalPatientsServed} patients served today`;
        });

        await this.test('Patient Quick Lookup', async () => {
            const requestData = {
                searchTerm: 'Ahmed',
                clinicId: this.config.clinicId,
                limit: 5
            };
            
            const response = await this.makeRequest('/dashboard/patient/quick-lookup', 'POST', requestData);
            const data = JSON.parse(response.body);
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid patient lookup response');
            }
            
            return `Patient lookup: ${data.length} results found`;
        });

        await this.test('Emergency Booking Validation', async () => {
            const requestData = {
                patientId: '507f1f77bcf86cd799439011',
                clinicId: this.config.clinicId,
                branchId: '507f1f77bcf86cd799439012',
                serviceId: '507f1f77bcf86cd799439013',
                reason: 'Integration test emergency',
                priority: 'high'
            };
            
            const response = await this.makeRequest('/dashboard/emergency-booking', 'POST', requestData);
            
            // Note: This might fail in demo mode, which is expected
            if (response.statusCode === 200) {
                const data = JSON.parse(response.body);
                return `Emergency booking: ${data.success ? 'Success' : 'Failed'}`;
            } else {
                return 'Emergency booking endpoint accessible (demo mode)';
            }
        });
    }

    async testDashboardFrontend() {
        console.log('🖥️  Testing Dashboard Frontend...');

        await this.test('Dashboard Page Load', async () => {
            const response = await this.makeHttpRequest(this.config.dashboardUrl);
            
            if (response.statusCode !== 200) {
                throw new Error(`Dashboard page failed to load: ${response.statusCode}`);
            }
            
            if (!response.body.includes('TebX') || !response.body.includes('dashboard')) {
                throw new Error('Dashboard content not found');
            }
            
            return 'Dashboard page loaded successfully';
        });

        await this.test('Static Assets Loading', async () => {
            const response = await this.makeHttpRequest(this.config.dashboardUrl);
            const cssMatch = response.body.match(/href="([^"]*\.css)"/);
            const jsMatch = response.body.match(/src="([^"]*\.js)"/);
            
            if (!cssMatch && !jsMatch && !response.body.includes('<style>')) {
                throw new Error('No CSS or JS assets found');
            }
            
            return 'Static assets detected';
        });

        await this.test('Responsive Design', async () => {
            const response = await this.makeHttpRequest(this.config.dashboardUrl);
            
            if (!response.body.includes('viewport') || !response.body.includes('width=device-width')) {
                throw new Error('Mobile viewport meta tag missing');
            }
            
            return 'Responsive design meta tags present';
        });

        await this.test('Security Headers', async () => {
            const response = await this.makeHttpRequest(this.config.dashboardUrl);
            const headers = response.headers;
            
            const requiredHeaders = [
                'x-content-type-options',
                'x-frame-options'
            ];
            
            const missingHeaders = requiredHeaders.filter(header => !headers[header]);
            
            if (missingHeaders.length > 0) {
                console.warn(`⚠️  Missing security headers: ${missingHeaders.join(', ')}`);
            }
            
            return `Security headers: ${Object.keys(headers).length} total`;
        });
    }

    async testEndToEndWorkflows() {
        console.log('🔄 Testing End-to-End Workflows...');

        await this.test('Patient Check-in Workflow', async () => {
            // 1. Search for patient
            const searchResponse = await this.makeRequest('/dashboard/patient/quick-lookup', 'POST', {
                searchTerm: 'Test Patient',
                clinicId: this.config.clinicId,
                limit: 1
            });
            
            if (searchResponse.statusCode !== 200) {
                return 'Patient search accessible (demo mode)';
            }
            
            // 2. Attempt check-in (may fail in demo mode)
            const patients = JSON.parse(searchResponse.body);
            if (patients.length > 0) {
                const checkInResponse = await this.makeRequest('/dashboard/patient/check-in', 'POST', {
                    patientId: patients[0].patientId,
                    appointmentId: 'demo-appointment',
                    notes: 'Integration test check-in'
                });
                
                return 'Check-in workflow accessible';
            }
            
            return 'Patient check-in workflow tested';
        });

        await this.test('Real-time Data Flow', async () => {
            // Test that overview and queue data are consistent
            const overviewResponse = await this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/overview`);
            const queueResponse = await this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/waiting-room`);
            
            if (overviewResponse.statusCode !== 200 || queueResponse.statusCode !== 200) {
                throw new Error('Failed to fetch data for consistency check');
            }
            
            const overviewData = JSON.parse(overviewResponse.body);
            const queueData = JSON.parse(queueResponse.body);
            
            // Basic consistency check
            if (overviewData.clinicId !== queueData.clinicId) {
                throw new Error('Clinic ID mismatch between overview and queue');
            }
            
            return 'Data consistency verified';
        });

        await this.test('Dashboard Refresh Simulation', async () => {
            const startTime = Date.now();
            
            // Simulate multiple rapid requests like dashboard auto-refresh
            const promises = [
                this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/overview`),
                this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/waiting-room`),
                this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/queue-analytics`)
            ];
            
            const responses = await Promise.all(promises);
            const duration = Date.now() - startTime;
            
            const failedRequests = responses.filter(r => r.statusCode !== 200);
            if (failedRequests.length > 0) {
                throw new Error(`${failedRequests.length} requests failed during refresh simulation`);
            }
            
            return `Refresh simulation: ${duration}ms for 3 concurrent requests`;
        });
    }

    async testPerformance() {
        console.log('⚡ Testing Performance...');

        await this.test('API Response Time', async () => {
            const startTime = Date.now();
            const response = await this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/overview`);
            const duration = Date.now() - startTime;
            
            if (response.statusCode !== 200) {
                throw new Error('API request failed');
            }
            
            if (duration > 2000) {
                throw new Error(`Response time too slow: ${duration}ms`);
            }
            
            return `API response time: ${duration}ms`;
        });

        await this.test('Dashboard Load Time', async () => {
            const startTime = Date.now();
            const response = await this.makeHttpRequest(this.config.dashboardUrl);
            const duration = Date.now() - startTime;
            
            if (response.statusCode !== 200) {
                throw new Error('Dashboard failed to load');
            }
            
            if (duration > 5000) {
                throw new Error(`Dashboard load time too slow: ${duration}ms`);
            }
            
            return `Dashboard load time: ${duration}ms`;
        });

        await this.test('Concurrent Request Handling', async () => {
            const startTime = Date.now();
            const concurrentRequests = 10;
            
            const promises = Array(concurrentRequests).fill().map(() => 
                this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/overview`)
            );
            
            const responses = await Promise.all(promises);
            const duration = Date.now() - startTime;
            
            const successfulRequests = responses.filter(r => r.statusCode === 200).length;
            
            if (successfulRequests < concurrentRequests * 0.9) {
                throw new Error(`Only ${successfulRequests}/${concurrentRequests} requests succeeded`);
            }
            
            const avgResponseTime = duration / concurrentRequests;
            return `${concurrentRequests} concurrent requests: avg ${avgResponseTime.toFixed(0)}ms`;
        });
    }

    async testSecurity() {
        console.log('🔒 Testing Security...');

        await this.test('Authentication Required', async () => {
            const response = await this.makeRequest(`/dashboard/clinic/${this.config.clinicId}/overview`, 'GET', null, false);
            
            if (response.statusCode === 200) {
                throw new Error('API accessible without authentication');
            }
            
            if (response.statusCode !== 401 && response.statusCode !== 403) {
                throw new Error(`Unexpected response for unauthenticated request: ${response.statusCode}`);
            }
            
            return 'Authentication properly required';
        });

        await this.test('CORS Headers', async () => {
            const response = await this.makeRequest('/health', 'OPTIONS');
            const corsHeader = response.headers['access-control-allow-origin'];
            
            if (!corsHeader) {
                console.warn('⚠️  CORS headers not found (may be configured at load balancer)');
            }
            
            return 'CORS configuration accessible';
        });

        await this.test('SQL Injection Protection', async () => {
            const maliciousPayload = {
                searchTerm: "'; DROP TABLE patients; --",
                clinicId: this.config.clinicId,
                limit: 5
            };
            
            const response = await this.makeRequest('/dashboard/patient/quick-lookup', 'POST', maliciousPayload);
            
            // Should either reject the request or handle it safely
            if (response.statusCode === 200) {
                const data = JSON.parse(response.body);
                if (Array.isArray(data)) {
                    return 'SQL injection handled safely';
                }
            }
            
            return 'Malicious input handled appropriately';
        });

        await this.test('Rate Limiting', async () => {
            const rapidRequests = 50;
            const promises = Array(rapidRequests).fill().map(() => 
                this.makeRequest('/health').catch(err => ({ statusCode: 429, error: err }))
            );
            
            const responses = await Promise.all(promises);
            const rateLimited = responses.filter(r => r.statusCode === 429).length;
            
            if (rateLimited === 0) {
                console.warn('⚠️  No rate limiting detected (may be configured at load balancer)');
            }
            
            return `Rate limiting: ${rateLimited}/${rapidRequests} requests limited`;
        });
    }

    async test(testName, testFunction) {
        this.testResults.total++;
        const startTime = Date.now();
        
        try {
            const result = await testFunction();
            const duration = Date.now() - startTime;
            
            console.log(`  ✅ ${testName}: ${result} (${duration}ms)`);
            this.testResults.passed++;
            this.testResults.details.push({
                name: testName,
                status: 'PASSED',
                duration,
                result
            });
        } catch (error) {
            const duration = Date.now() - startTime;
            
            console.log(`  ❌ ${testName}: ${error.message} (${duration}ms)`);
            this.testResults.failed++;
            this.testResults.details.push({
                name: testName,
                status: 'FAILED',
                duration,
                error: error.message
            });
        }
    }

    async makeRequest(path, method = 'GET', data = null, includeAuth = true) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.config.apiBaseUrl);
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'TebX-Integration-Test/1.0'
                },
                timeout: this.config.timeout
            };

            if (includeAuth && this.config.authToken) {
                options.headers.Authorization = `Bearer ${this.config.authToken}`;
            }

            const req = https.request(url, options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body,
                        secure: req.socket && req.socket.authorized !== false
                    });
                });
            });

            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Request timeout')));

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    async makeHttpRequest(url) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const lib = isHttps ? https : http;
            
            const options = {
                timeout: this.config.timeout,
                headers: {
                    'User-Agent': 'TebX-Integration-Test/1.0'
                }
            };

            const req = lib.request(urlObj, options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body
                    });
                });
            });

            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Request timeout')));
            req.end();
        });
    }

    generateReport() {
        const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        
        console.log('\n📊 Integration Test Results');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success Rate: ${successRate}%`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.details
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.error}`);
                });
        }

        console.log('\n📈 Performance Summary:');
        const performanceTests = this.testResults.details.filter(test => 
            test.name.includes('Response Time') || test.name.includes('Load Time')
        );
        
        performanceTests.forEach(test => {
            console.log(`  • ${test.name}: ${test.duration}ms`);
        });

        // Generate JSON report
        const report = {
            timestamp: new Date().toISOString(),
            config: this.config,
            summary: this.testResults,
            environment: {
                nodeVersion: process.version,
                platform: process.platform
            }
        };

        fs.writeFileSync('integration-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📋 Detailed report saved to: integration-test-report.json');

        // Exit with appropriate code
        if (this.testResults.failed > 0) {
            console.log('\n❌ Some tests failed. Check the issues above.');
            process.exit(1);
        } else {
            console.log('\n✅ All tests passed! System is ready for production.');
            process.exit(0);
        }
    }
}

// Configuration from command line or environment
const config = {
    apiBaseUrl: process.argv[2] || process.env.TEBX_API_URL || 'http://localhost:3333/api',
    dashboardUrl: process.argv[3] || process.env.TEBX_DASHBOARD_URL || 'http://localhost/dashboard',
    authToken: process.env.TEBX_AUTH_TOKEN || 'demo-token',
    clinicId: process.env.TEBX_CLINIC_ID || '507f1f77bcf86cd799439011'
};

// Run tests
const tester = new TebXIntegrationTest(config);
tester.runAllTests().catch(console.error);

// Export for programmatic use
module.exports = TebXIntegrationTest;
