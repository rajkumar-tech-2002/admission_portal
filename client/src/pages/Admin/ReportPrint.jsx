import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RecordReport from '../../components/layout/RecordReport';

const ReportPrint = () => {
    const { id } = useParams();

    useEffect(() => {
        // Set document title to a space to hide browser headers
        const originalTitle = document.title;
        document.title = " ";

        const timer = setTimeout(() => {
            window.print();
        }, 1500);

        return () => {
            clearTimeout(timer);
            document.title = originalTitle;
        };
    }, []);

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <RecordReport recordId={id} standalone={true} />
        </div>
    );
};

export default ReportPrint;
