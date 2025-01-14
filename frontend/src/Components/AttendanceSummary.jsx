import "../App.css";

const AttendanceSummary = ({ userData }) => {
  const keys = ["hadir", "tidak_hadir", "terlambat_pulang_cepat"];
  const labels = ["Hadir", "Izin / Sakit", "Terlambat"];
  const colors = ["green", "yellow", "red"];

  return (
    <div className="attendance-summary">
      <h3>Rekapan Presensi (Bulan Ini)</h3>
      <div className="attendance-items">
        {keys.map((key, index) => (
          <div key={key} className={`attendance-item ${colors[index]}`}>
            <p>{userData?.[key] || 0}</p>
            <span>{labels[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSummary;
