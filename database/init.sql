CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(120),
  phone VARCHAR(20),
  department VARCHAR(120),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  is_certified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  model VARCHAR(80),
  serial_number VARCHAR(80) UNIQUE,
  location VARCHAR(120),
  category VARCHAR(60),
  description TEXT,
  purchase_date DATE,
  image_url VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  requires_certification TINYINT(1) DEFAULT 0,
  min_reserve_minutes INT NOT NULL DEFAULT 30,
  max_reserve_hours INT NOT NULL DEFAULT 8,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  user_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  checkin_time DATETIME,
  checkout_time DATETIME,
  actual_duration_minutes INT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  qr_code_token VARCHAR(64) UNIQUE,
  purpose TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipments(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_equipment_time (equipment_id, start_time, end_time),
  INDEX idx_user (user_id),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reservation_id INT NOT NULL,
  type VARCHAR(40) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id),
  INDEX idx_user (user_id)
);

CREATE TABLE IF NOT EXISTS operation_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_name VARCHAR(120) NOT NULL,
  owner_name VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  metric VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, name, email, phone, department, role, password_hash, is_certified) VALUES
('zhangsan', '张三', 'zhangsan@lab.edu', '13800138001', '物理系', 'user', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
('lisi', '李四', 'lisi@lab.edu', '13800138002', '化学系', 'user', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
('wangwu', '王五', 'wangwu@lab.edu', '13800138003', '生物系', 'user', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0),
('admin', '管理员', 'admin@lab.edu', '13800138000', '实验室管理处', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1);

INSERT INTO equipments (name, model, serial_number, location, category, description, status, requires_certification, min_reserve_minutes, max_reserve_hours) VALUES
('光学显微镜', 'Olympus BX53', 'EQ-2024-001', 'A栋301室', '光学仪器', '高端研究级生物显微镜，配备荧光附件', 'available', 1, 30, 8),
('扫描电子显微镜', 'Hitachi SU5000', 'EQ-2024-002', 'A栋302室', '电子仪器', '高分辨率场发射扫描电镜', 'available', 1, 60, 24),
('紫外可见分光光度计', 'Shimadzu UV-2600', 'EQ-2024-003', 'B栋201室', '光学仪器', '双光束紫外可见近红外分光光度计', 'available', 0, 30, 4),
('高效液相色谱仪', 'Agilent 1290', 'EQ-2024-004', 'B栋202室', '生化设备', '超高效液相色谱系统', 'available', 1, 60, 12),
('原子吸收光谱仪', 'Thermo iCE 3500', 'EQ-2024-005', 'B栋203室', '生化设备', '石墨炉原子吸收光谱仪', 'available', 1, 60, 8),
('激光共聚焦显微镜', 'Zeiss LSM 980', 'EQ-2024-006', 'A栋303室', '光学仪器', '激光共聚焦扫描显微镜系统', 'available', 1, 60, 12),
('傅里叶变换红外光谱仪', 'Bruker Vertex 70', 'EQ-2024-007', 'B栋204室', '光学仪器', '傅里叶变换红外光谱仪', 'available', 0, 30, 4),
('X射线衍射仪', 'Bruker D8 Advance', 'EQ-2024-008', 'C栋101室', '分析仪器', 'X射线多晶衍射仪', 'available', 1, 60, 8),
('核磁共振波谱仪', 'Bruker AVANCE 400', 'EQ-2024-009', 'C栋102室', '分析仪器', '400MHz核磁共振波谱仪', 'available', 1, 120, 24),
('高速离心机', 'Eppendorf 5810R', 'EQ-2024-010', 'B栋205室', '生化设备', '冷冻高速离心机', 'available', 0, 30, 4);

INSERT INTO operation_records (module_name, owner_name, status, metric) VALUES
('设备档案与分类管理', '运营组', 'ready', '100%');
