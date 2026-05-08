import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Download, Search, ArchiveRestore } from 'lucide-react';
import apiService from '../../services/api.service';
import styles from '../../components/css/Dashboard.module.css'; // Reuse dashboard styles
import toast from 'react-hot-toast';

const ArchivedList = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    
    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            if (fromDate) params.append('fromDate', fromDate);
            if (toDate) params.append('toDate', toDate);
            params.append('isArchived', 'true');

            const response = await apiService.get(`/records?${params.toString()}`);
            if (response.data.success) {
                setRecords(response.data.data);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Error fetching archived records:', error);
            toast.error('Failed to load archived records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [search, status, fromDate, toDate]);

    // Pagination Logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(records.length / recordsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleResetFilters = () => {
        setSearch('');
        setStatus('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
    };

    const handleExport = () => {
        if (records.length === 0) return toast.error('No records to export');
        
        const exportData = records.map(r => ({
            'Reg ID': r.reg_id,
            'Name': r.std_name,
            'Mobile': r.std_mobile_no,
            'City': r.city,
            'Community': r.community,
            'Dept': r.selected_dept,
            'Course': r.selected_course,
            'Status': r.admission_status,
            'Date': new Date(r.admission_date_time).toLocaleDateString()
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Archived_Admissions");
        XLSX.writeFile(wb, `Archived_Records_${new Date().getTime()}.xlsx`);
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.mainCard}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArchiveRestore size={24} color="var(--primary-color)" />
                        <h2 style={{color:"var(--primary-color)"}}>Archived Records</h2>
                    </div>
                    <button onClick={handleExport} className={styles.exportBtn}>
                        <Download size={18} /> Export Excel
                    </button>
                </div>

                <div className={styles.filters}>
                    {/* ... (filter groups) ... */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Global Search</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                className={styles.searchInput} 
                                placeholder="Search name, id, mobile..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search size={16} style={{ position: 'absolute', right: 10, top: 10, color: '#9ca3af' }}/>
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Status</label>
                        <select 
                            className={styles.selectInput}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Enquiry">Enquiry</option>
                            <option value="Admitted">Admitted</option>
                            <option value="Discontinue">Discontinue</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>From Date</label>
                        <input 
                            type="date" 
                            className={styles.dateInput}
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>To Date</label>
                        <input 
                            type="date" 
                            className={styles.dateInput}
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.resetRow}>
                    <button onClick={handleResetFilters} className={styles.resetFiltersBtn}>
                        Reset All Filters
                    </button>
                </div>

                <div className={styles.tableControls}>
                    <div className={styles.limitSelector}>
                        <label>Show</label>
                        <select 
                            value={recordsPerPage} 
                            onChange={(e) => {
                                setRecordsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className={styles.limitSelect}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <label>entries</label>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading archived records...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Reg_ID</th>
                                    <th>Date & Time</th>
                                    <th>Name</th>
                                    <th>RegNo</th>
                                    <th>Mobile</th>
                                    <th>UG/PG</th>
                                    <th>Dept</th>
                                    <th>Course</th>
                                    <th>Aadhaar</th>
                                    <th>Refer Email</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.length > 0 ? (
                                    currentRecords.map((record) => (
                                        <tr key={record.id}>
                                            <td><strong>{record.reg_id}</strong></td>
                                            <td>{new Date(record.admission_date_time).toLocaleString()}</td>
                                            <td>{record.std_name}</td>
                                            <td>{record.reg_no_12th}</td>
                                            <td>{record.std_mobile_no}</td>
                                            <td>{record.selected_ug_pg}</td>
                                            <td>{record.selected_dept}</td>
                                            <td>{record.selected_course}</td>
                                            <td>{record.aadhaar_no}</td>
                                            <td>{record.reference_email}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles['status-' + record.admission_status]}`}>
                                                    {record.admission_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" style={{ textAlign: 'center', padding: '2rem' }}>No archived records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && records.length > 0 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, records.length)} of {records.length} entries
                        </div>
                        <div className={styles.paginationControls}>
                            <button 
                                className={styles.pageBtn} 
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    className={`${styles.pageBtn} ${currentPage === number ? styles.activePage : ''}`}
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </button>
                            ))}
                            <button 
                                className={styles.pageBtn} 
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArchivedList;
