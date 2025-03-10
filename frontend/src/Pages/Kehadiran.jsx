import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { ExclamationTriangleIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Layout from '../Components/Layout';
import { getFormData, formatDate, addDefaultKeys, getCombinedValues } from '../utils/utils';
import ApiService from '../utils/ApiService';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const STATUS_COLORS = {
  Normal: 'bg-green-500 text-white',
  Hadir: 'bg-green-500 text-white',
  'Tidak Normal': 'bg-red-500 text-white',
  'Dinas Luar': 'bg-gray-600 text-white',
  'Izin/Sakit': 'bg-yellow-500 text-black',
};

const getStatusLabel = (keterangan) => {
  const statusMap = {
    'Dinas Luar': 'Dinas Luar',
    'Masuk Normal': 'Normal',
    'Pulang Normal': 'Normal',
    'Terlambat Masuk': 'Tidak Normal',
    'Pulang Cepat': 'Tidak Normal',
    '---': 'Tidak Normal',
  };
  return statusMap[keterangan] || 'Izin/Sakit';
};

const LoadingPlaceholder = () => (
  <div className="animate-pulse bg-white h-32 w-full rounded-md" />
);

const NoDataMessage = () => (
  <div className="w-full max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
    <div className="flex items-center gap-3">
      <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
      <h4 className="text-lg font-semibold">Warning</h4>
    </div>
    <p className="mt-2 text-sm">Tidak ada data kehadiran presensi yang tersedia. Harap coba lagi nanti.</p>
  </div>
);

const HistoryList = ({ historyData }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.2 }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col rounded-lg p-4 shadow-md w-full max-w-md mx-auto bg-white">
        <div className="flex flex-col items-center border-b pb-3">
          <img
            src={historyData.img_location}
            alt="Foto Profil"
            className="w-20 h-20 rounded-full border-2 border-gray-300"
          />
          <p className="font-semibold text-lg mt-2 text-center">{historyData.nama_lengkap}</p>
        </div>
        {historyData.result.map((history, i) => {
          const statusLabel = getStatusLabel(history.keterangan);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col mt-3 shadow-sm rounded-lg bg-gray-100 p-2">
                <div
                  className={`w-full text-center py-2 font-medium text-sm rounded-t-lg ${STATUS_COLORS[statusLabel]}`}
                >
                  {history.status_kehadiran}
                </div>
                <div className="flex items-center gap-3 py-4">
                  <img
                    src={history.foto_presensi}
                    alt="Foto Presensi"
                    className="w-14 h-14 rounded-lg border border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <CalendarIcon className="w-4 h-4" />
                      <p>{formatDate(history.tanggal_presensi)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <ClockIcon className="w-4 h-4" />
                      <p>{history.waktu_presensi}</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full text-center py-2 rounded-b-lg font-medium text-sm ${STATUS_COLORS[statusLabel]}`}
                >
                  {statusLabel}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  </AnimatePresence>
);

export default function Kehadiran() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  if (!Cookies.get("csrf")) {
    ApiService.getCsrf();
  }

  useEffect(() => {
    if (id === undefined) return;
    if (!id) {
      navigate('*');
    } else {
      setLoading(true);
    }
  }, [id, navigate]);

  const fetchHistory = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const keys = ["token"];
    const formValues = [id];
    const storedValues = getCombinedValues([]); console.log("storedValues", storedValues);
    const values = [...new Set([...formValues, ...storedValues].filter(value => value !== null))];
    console.log("values", values);
    const sanitizedKeys = addDefaultKeys(keys).filter(key => key !== "devop-sso"); console.log("sanitizedKeys", sanitizedKeys);
    const formData = getFormData(sanitizedKeys, values); console.log("formData", formData);
    const res = await ApiService.processApiRequest("reports", formData, null, false);
    if (res?.data) {
      if (Array.isArray(res.data.data.result)) {
        if (JSON.stringify(historyData) !== JSON.stringify(res.data.data)) {
          setHistoryData(res.data.data);
        }
      } else {
        console.warn('Data result tidak ditemukan atau bukan array');
        setHistoryData([]);
      }
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="history-container h-screen flex flex-col overflow-y-auto">
      <Layout link="*" label="Presensi Kehadiran">
        <div className="custom-card mt-10">
          {loading ? <LoadingPlaceholder /> : historyData?.result?.length > 0 ? <HistoryList historyData={historyData} /> : <NoDataMessage />}
        </div>
      </Layout>
    </div>
  );
}