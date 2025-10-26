-- 设置基本权限
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

GRANT SELECT ON detections TO anon;
GRANT ALL PRIVILEGES ON detections TO authenticated;

GRANT SELECT ON segments TO anon;
GRANT ALL PRIVILEGES ON segments TO authenticated;

GRANT SELECT ON reports TO anon;
GRANT ALL PRIVILEGES ON reports TO authenticated;

-- 创建行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "用户只能查看自己的数据" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的数据" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 检测记录表策略
CREATE POLICY "用户只能查看自己的检测记录" ON detections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的检测记录" ON detections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的检测记录" ON detections
    FOR UPDATE USING (auth.uid() = user_id);

-- 分段检测表策略
CREATE POLICY "用户只能查看自己的分段检测结果" ON segments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM detections 
            WHERE detections.id = segments.detection_id 
            AND detections.user_id = auth.uid()
        )
    );

-- 报告表策略
CREATE POLICY "用户只能查看自己的报告" ON reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的报告" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的报告" ON reports
    FOR UPDATE USING (auth.uid() = user_id);