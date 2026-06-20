# 鏃犱汉鏈虹浠ｇ爜缁存姢鏂囨。

鏈枃妗ｉ潰鍚戝悗缁帴鎵嬫棤浜烘満绔紑鍙戝拰杩愮淮鐨勫悓瀛︼紝璇存槑 Jetson 涓?ROS2 宸ヤ綔绌洪棿鐨勪唬鐮佺粨鏋勩€佹牳蹇冩暟鎹祦銆佸惎鍔ㄦ柟寮忋€佸悗鍙版帴鍙ｅ拰甯歌鎺掗殰鏂规硶銆?
## 1. 鐜姒傝

- 璁惧锛欽etson 鏈鸿浇鐢佃剳
- 绯荤粺锛歎buntu + ROS2 Humble
- 宸ヤ綔绌洪棿锛歚/home/jetson/hjm/ros2_ws`
- 婧愮爜鐩綍锛歚/home/jetson/hjm/ros2_ws/src`
- 鍥剧墖鐩綍锛歚/home/jetson/hjm/ros2_ws/images`
- 鎷嶇収 GPS 璁板綍锛歚/home/jetson/hjm/ros2_ws/captures2.csv`
- 鍚庡彴鏈嶅姟鍣細`http://SERVER_IP`

杩涘叆宸ヤ綔绌洪棿鍚庯紝甯哥敤鐜鍔犺浇鍛戒护锛?
```bash
cd /home/jetson/hjm/ros2_ws
source /opt/ros/humble/setup.bash
source install/setup.bash
```

鏋勫缓鍗曚釜鍖咃細

```bash
colcon build --packages-select 鍖呭悕 --symlink-install
```

鏋勫缓涓婁紶鐩稿叧鍖咃細

```bash
colcon build --packages-select uav_image_uploader uav_telemetry_uploader --symlink-install
```

## 2. 绯荤粺鏁版嵁娴?
鏃犱汉鏈虹鐩墠鍥寸粫涓ゆ潯涓婚摼璺繍琛屻€?
### 2.1 鍥惧儚閲囬泦涓庝笂浼犻摼璺?
1. `gpio_trigger` 鐩戝惉 GPIO 瑙﹀彂淇″彿锛屽苟璇诲彇 MAVROS GPS銆?2. `gpio_trigger` 鍙戝竷 `/mavros/camera/image_captured`銆?3. `camera_sony` 璁㈤槄 `/mavros/camera/image_captured`锛岃Е鍙?Sony A7C2 鎷嶇収銆?4. `camera_sony` 淇濆瓨 ARW 鍘熷浘鍒?`~/hjm/ros2_ws/images`锛屽啓鍏?`captures2.csv`锛屽苟鍙戝竷 `photo_saved`銆?5. `uav_image_uploader` 璁㈤槄 `photo_saved`銆?6. `uav_image_uploader` 浠?ARW 涓彁鍙?JPG 棰勮鍥撅紝璇诲彇 `captures2.csv` 涓殑 GPS锛屼笂浼犲埌鍚庡彴 `/api/capture-images`銆?7. 鍚庡彴鎶婂浘鐗囨枃浠朵繚瀛樺埌鏈嶅姟鍣紝鏁版嵁搴撹褰曚换鍔＄紪鍙枫€佽澶囩被鍨嬨€佸浘鐗?URL 鍜?GPS銆?8. Web 鍚庡彴鎸変换鍔″姞杞藉浘鐗囩偣锛屽悓鍧愭爣鍥剧墖浼氳仛鍚堟樉绀恒€?
### 2.2 瀹炴椂瀹氫綅涓婁紶閾捐矾

1. MAVROS 鍙戝竷鏃犱汉鏈哄疄鏃跺畾浣嶃€佺數閲忋€侀珮搴︺€侀€熷害銆?2. `uav_telemetry_uploader` 璁㈤槄 MAVROS 璇濋銆?3. `uav_telemetry_uploader` 姣?2 绉掑悜鍚庡彴 `/api/telemetry` 涓婁紶涓€娆￠仴娴嬨€?4. 鍚庡彴鏇存柊 `devices` 鍜?`telemetry` 琛ㄣ€?5. Web 鍚庡彴閫氳繃 `/api/telemetry/latest` 鏄剧ず鏃犱汉鏈哄疄鏃朵綅缃€佺粡绾害銆侀珮搴︺€侀€熷害銆佺數閲忋€?
## 3. 鍔熻兘鍖呰鏄?
### 3.1 `gpio_trigger`

鑱岃矗锛?
- 鐩戝惉澶栭儴 GPIO 瑙﹀彂淇″彿銆?- 璁㈤槄 `/mavros/global_position/global` 鑾峰彇褰撳墠 GPS銆?- 鍙戝竷 `/mavros/camera/image_captured`锛屾ā鎷?MAVROS 鐩告満鎹曡幏浜嬩欢锛屼緵 Sony 鐩告満鑺傜偣浣跨敤銆?
鍏抽敭鏂囦欢锛?
- `gpio_trigger/gpio_trigger/gpio_trigger_node.py`
- `gpio_trigger/package.xml`

鍏抽敭璇濋锛?
- 璁㈤槄锛歚/mavros/global_position/global`
- 鍙戝竷锛歚/mavros/camera/image_captured`

缁存姢娉ㄦ剰锛?
- 鑻ラ鎺?GPS 璇濋鍙樺寲锛岄渶瑕佸悓姝ヤ慨鏀?GPS 璁㈤槄璇濋銆?- 鑻ヨЕ鍙戞柟寮忕敱 GPIO 鏀逛负椋炴帶鑸偣瑙﹀彂锛屽簲淇濈暀鍙戝竷 `/mavros/camera/image_captured` 鐨勬帴鍙ｏ紝杩欐牱涓嶄細褰卞搷 `camera_sony`銆?
### 3.2 `camera_sony`

鑱岃矗锛?
- 鍩轰簬 Sony Camera Remote SDK 鎺у埗 Sony A7C2銆?- 璁㈤槄 `/mavros/camera/image_captured`銆?- 鏀跺埌瑙﹀彂鍚庢媿鐓у苟淇濆瓨 ARW銆?- 鍙戝竷 `photo_saved`锛岄€氱煡鍚庣画涓婁紶鑺傜偣銆?- 缁存姢鎷嶆憚璁板綍 CSV锛歚captures2.csv`銆?
鍏抽敭鏂囦欢锛?
- `camera_sony/app/RemoteCli.cpp`
- `camera_sony/app/SonyCameraNode.h`
- `camera_sony/CMakeLists.txt`
- `camera_sony/package.xml`

鍏抽敭璇濋锛?
- 璁㈤槄锛歚/mavros/camera/image_captured`
- 鍙戝竷锛歚photo_saved`

杈撳嚭鏂囦欢锛?
- ARW 鍘熷浘锛歚/home/jetson/hjm/ros2_ws/images/*.ARW`
- 鎷嶆憚璁板綍锛歚/home/jetson/hjm/ros2_ws/captures2.csv`

缁存姢娉ㄦ剰锛?
- 涓嶅缓璁洿鎺ユ敼 SDK 鐩稿叧搴曞眰浠ｇ爜锛岄櫎闈炵‘璁ょ浉鏈鸿繛鎺ャ€佷繚瀛樿矾寰勬垨瑙﹀彂鍗忚闇€瑕佽皟鏁淬€?- `photo_saved` 鏄悗缁笂浼犺妭鐐逛緷璧栫殑鍏抽敭鎺ュ彛锛屼慨鏀规秷鎭唴瀹瑰墠瑕佸悓姝ヤ慨鏀?`uav_image_uploader`銆?
### 3.3 `uav_image_uploader`

鑱岃矗锛?
- 涓嶆敼鍘熸湁鎷嶇収浠ｇ爜锛岀嫭绔嬪畬鎴愬浘鐗囦笂浼犮€?- 璁㈤槄 `photo_saved`銆?- 绛夊緟鍥剧墖鏂囦欢钀界洏銆?- 璇诲彇 `captures2.csv` 涓搴斿浘鐗囩殑 GPS銆?- 鑻ユ簮鍥句负 ARW锛屼娇鐢?`exiftool` 鎻愬彇 JPG 棰勮鍥俱€?- 涓婁紶 JPG 鍒板悗鍙?`/api/capture-images`銆?- 鐢ㄦ湰鍦扮姸鎬佹枃浠堕伩鍏嶉噸澶嶄笂浼犮€?
鍏抽敭鏂囦欢锛?
- `uav_image_uploader/uav_image_uploader/uav_image_uploader.py`
- `uav_image_uploader/launch/uav_image_uploader.launch.py`
- `uav_image_uploader/setup.py`
- `uav_image_uploader/package.xml`

榛樿鍙傛暟锛?
```text
image_dir: /home/jetson/hjm/ros2_ws/images
preview_dir: /home/jetson/hjm/ros2_ws/images/jpg_preview
csv_path: /home/jetson/hjm/ros2_ws/captures2.csv
api_url: http://SERVER_IP/api/capture-images
mission_code: A-03
device_code: UAV-001
device_type: uav
photo_topic: photo_saved
state_path: /home/jetson/hjm/ros2_ws/uav_image_uploader_uploaded.json
```

鍚姩锛?
```bash
cd /home/jetson/hjm/ros2_ws
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch uav_image_uploader uav_image_uploader.launch.py
```

鍒囨崲浠诲姟缂栧彿锛?
```bash
ros2 run uav_image_uploader uav_image_uploader --ros-args -p mission_code:=02鐢板潡
```

缁存姢娉ㄦ剰锛?
- ARW 鍘熷浘涓嶄細涓婁紶锛屽彧涓婁紶鎻愬彇鍑烘潵鐨?JPG 棰勮锛屼究浜庡悗鍙板揩閫熸樉绀恒€?- JPG 棰勮鐩綍鏄?`images/jpg_preview`銆?- 濡傛灉闇€瑕侀噸鏂颁笂浼犳煇浜涘浘鐗囷紝鍙互缂栬緫鎴栧垹闄?`uav_image_uploader_uploaded.json`锛屼絾瑕侀伩鍏嶉噸澶嶆薄鏌撴暟鎹簱銆?- 濡傛灉鎻愮ず鏃犳硶鎻愬彇 JPG锛屽厛妫€鏌?`exiftool` 鏄惁鍙敤锛?
```bash
exiftool -ver
```

### 3.4 `uav_telemetry_uploader`

鑱岃矗锛?
- 涓嶆敼椋炴帶/MAVROS 浠ｇ爜锛岀嫭绔嬩笂浼犳棤浜烘満瀹炴椂閬ユ祴銆?- 璁㈤槄 MAVROS GPS銆佺數閲忋€侀珮搴︺€侀€熷害銆?- 姣?2 绉掍笂浼犲埌鍚庡彴 `/api/telemetry`銆?
鍏抽敭鏂囦欢锛?
- `uav_telemetry_uploader/uav_telemetry_uploader/uav_telemetry_uploader.py`
- `uav_telemetry_uploader/launch/uav_telemetry_uploader.launch.py`
- `uav_telemetry_uploader/setup.py`
- `uav_telemetry_uploader/package.xml`

榛樿璁㈤槄璇濋锛?
```text
gps_topic: /mavros/global_position/global
battery_topic: /mavros/battery
rel_alt_topic: /mavros/global_position/rel_alt
velocity_topic: /mavros/local_position/velocity_local
```

榛樿涓婁紶鍙傛暟锛?
```text
api_url: http://SERVER_IP/api/telemetry
mission_code: A-03
device_code: UAV-001
device_type: uav
upload_interval_sec: 2.0
request_timeout_sec: 3.0
```

鍚姩锛?
```bash
cd /home/jetson/hjm/ros2_ws
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 launch uav_telemetry_uploader uav_telemetry_uploader.launch.py
```

鍒囨崲浠诲姟缂栧彿锛?
```bash
ros2 run uav_telemetry_uploader uav_telemetry_uploader --ros-args -p mission_code:=02鐢板潡
```

缁存姢娉ㄦ剰锛?
- MAVROS 鏈惎鍔ㄦ椂锛岃鑺傜偣鑳藉惎鍔紝浣嗕笉浼氫笂浼犳湁鏁?GPS銆?- 濡傛灉鍚庡彴鐪嬩笉鍒版棤浜烘満浣嶇疆锛屽厛妫€鏌?GPS 璇濋鏄惁鏈夋暟鎹細

```bash
ros2 topic echo /mavros/global_position/global
```

### 3.5 `px4_aliyun_bridge`

鑱岃矗锛?
- 鍘熸湁 PX4 鍒伴樋閲屼簯 IoT 鐨勬ˉ鎺ュ寘銆?- 褰撳墠鍚庡彴绯荤粺宸叉敼涓洪€氳繃 FastAPI 鎺ユ敹 `/api/telemetry` 鍜?`/api/capture-images`銆?
缁存姢寤鸿锛?
- 濡傛灉鍚庣画浠嶄娇鐢ㄩ樋閲屼簯 IoT锛屽彲淇濈暀璇ュ寘銆?- 濡傛灉鍙蛋鏈」鐩悗鍙帮紝涓嶅缓璁妸鏂伴€昏緫鍐欏洖璇ュ寘锛岄伩鍏嶆棫 IoT 閫昏緫鍜屽綋鍓?HTTP API 娣峰湪涓€璧枫€?
### 3.6 `aliyun_image_detect_cpp` / `image_detect` / `mqtt_image` / `message_tran`

鑱岃矗锛?
- 鍘嗗彶鍥惧儚妫€娴嬨€丱SS/MQTT 娴嬭瘯鍜屼紶杈撳疄楠屼唬鐮併€?
缁存姢寤鸿锛?
- 杩欎簺鍖呬腑鍙兘瀛樺湪鍘嗗彶 OSS 鎴栨祴璇曢厤缃紝涓嶅缓璁綔涓哄綋鍓嶅悗鍙颁笂浼犱富閾捐矾銆?- 褰撳墠鍥剧墖涓婁紶浠?`uav_image_uploader` 涓哄噯銆?- 鑻ヨ鎺ュ叆 OSS锛屽簲鍦ㄥ悗鍙版湇鍔″櫒渚х粺涓€鎺?OSS锛屼笉寤鸿 Jetson 鐩存帴淇濆瓨 AccessKey銆?
### 3.7 `detect_cpp` / `detect_cpp_simple`

鑱岃矗锛?
- C++ 鏈湴璇嗗埆/鎺ㄧ悊瀹為獙鍖呫€?
缁存姢寤鸿锛?
- 濡傛灉鍚庣画瑕佸湪鏃犱汉鏈虹鐩存帴鎻愬彇鍥惧儚鐗瑰緛锛屽彲鍦ㄨ繖浜涘寘鍩虹涓婃墿灞曘€?- 褰撳墠鍚庡彴灞曠ず涓昏渚濊禆宸蹭笂浼犲浘鐗囧拰鏈嶅姟鍣ㄦ暟鎹簱锛屾帹鐞嗙粨鏋滃皻鏈綔涓烘寮?API 瀛楁鎺ュ叆銆?
### 3.8 `gimbal_controller`

鑱岃矗锛?
- 浜戝彴鎺у埗鐩稿叧 Python 鍖呫€?
缁存姢寤鸿锛?
- 鑻ュ悗缁璁╃浉鏈烘寜鐓т换鍔＄偣璋冩暣瑙掑害锛屽彲鐢变换鍔¤鍒掓ā鍧楄緭鍑虹洰鏍囪搴︼紝鍐嶆帴鍏ヨ鍖呫€?
### 3.9 `multispectral_camera`

鑱岃矗锛?
- 澶氬厜璋辩浉鏈鸿Е鍙戣妭鐐广€?
缁存姢寤鸿锛?
- 褰撳墠涓婚摼璺娇鐢?Sony A7C2锛涘鏋滃悗缁鍔犲鍏夎氨鏁版嵁锛岄渶瑕佸鐢?`uav_image_uploader` 鐨勪笂浼犳€濇兂锛屼负澶氬厜璋卞浘鐗囨柊澧炶澶囩被鍨嬫垨鏁版嵁绫诲瀷銆?
### 3.10 `lidar` / `LSLIDAR_X_ROS2` / `m10p_mapper` / `rice_mapping`

鑱岃矗锛?
- 婵€鍏夐浄杈俱€佸缓鍥惧拰姘寸ɑ鐢板潡鏄犲皠鐩稿叧浠ｇ爜銆?
缁存姢寤鸿锛?
- 褰撳墠鍚庡彴涓昏灞曠ず鍥惧儚鐐广€佺儹鍔涘浘銆佷换鍔″尯鍩熷拰璁惧浣嶇疆銆?- 鑻ュ悗缁灞曠ず涓夌淮閲嶅缓銆佺ɑ鏍珮搴︾偣浜戞垨闆疯揪寤哄浘缁撴灉锛屽簲鏂板鐙珛涓婁紶鎺ュ彛鍜屾暟鎹簱琛紝涓嶈鐩存帴濉炶繘 `capture_images`銆?
## 4. 鍚庡彴鎺ュ彛

### 4.1 涓婁紶鏃犱汉鏈哄疄鏃跺畾浣?
鎺ュ彛锛?
```http
POST http://SERVER_IP/api/telemetry
Content-Type: multipart/form-data 鎴?application/x-www-form-urlencoded
```

瀛楁锛?
```text
device_code: UAV-001
device_type: uav
lng: 缁忓害
lat: 绾害
battery_level: 鐢甸噺锛屽彲閫?mission_code: 褰撳墠浠诲姟缂栧彿锛屽彲閫?altitude: 楂樺害锛屽彲閫?speed: 閫熷害锛屽彲閫?status: GPS 鐘舵€侊紝鍙€?```

鎵嬪伐娴嬭瘯锛?
```bash
curl -X POST http://SERVER_IP/api/telemetry \
  -F device_code=UAV-001 \
  -F device_type=uav \
  -F mission_code=A-03 \
  -F lng=112.6584503 \
  -F lat=23.1558313 \
  -F altitude=18.6 \
  -F speed=2.1 \
  -F battery_level=82 \
  -F status=fix
```

### 4.2 涓婁紶閲囬泦鍥惧儚

鎺ュ彛锛?
```http
POST http://SERVER_IP/api/capture-images
Content-Type: multipart/form-data
```

瀛楁锛?
```text
file: JPG/PNG/WEBP 鏂囦欢
device_type: uav 鎴?ground
device_code: UAV-001
mission_code: 褰撳墠浠诲姟缂栧彿
title: 鍥剧墖鏍囬
lng: 缁忓害
lat: 绾害
captured_at: 閲囬泦鏃堕棿锛屽彲閫?```

鎵嬪伐娴嬭瘯锛?
```bash
curl -X POST http://SERVER_IP/api/capture-images \
  -F file=@/home/jetson/hjm/ros2_ws/images/jpg_preview/DSC00001.jpg \
  -F device_type=uav \
  -F device_code=UAV-001 \
  -F mission_code=A-03 \
  -F title=DSC00001.jpg \
  -F lng=112.6584503 \
  -F lat=23.1558313
```

## 5. 鎺ㄨ崘鍚姩椤哄簭

瀹為檯椋炶閲囬泦鏃跺缓璁寜涓嬮潰椤哄簭鍚姩銆?
1. 鍚姩椋炴帶銆丮AVROS锛岀‘璁?GPS 鏈夋暟鎹€?
```bash
ros2 topic echo /mavros/global_position/global
```

2. 鍚姩 Sony 鐩告満鑺傜偣銆?
```bash
ros2 run camera_sony camera_sony
```

鍏蜂綋鍙墽琛屽悕浠?`ros2 pkg executables camera_sony` 涓哄噯銆?
3. 鍚姩 GPIO 瑙﹀彂鑺傜偣銆?
```bash
ros2 run gpio_trigger gpio_trigger_node
```

鍏蜂綋鍙墽琛屽悕浠?`ros2 pkg executables gpio_trigger` 涓哄噯銆?
4. 鍚姩鍥剧墖涓婁紶鑺傜偣銆?
```bash
ros2 launch uav_image_uploader uav_image_uploader.launch.py
```

5. 鍚姩瀹氫綅涓婁紶鑺傜偣銆?
```bash
ros2 launch uav_telemetry_uploader uav_telemetry_uploader.launch.py
```

6. 鎵撳紑鍚庡彴椤甸潰妫€鏌ャ€?
```text
http://SERVER_IP
```

## 6. 甯哥敤妫€鏌ュ懡浠?
鏌ョ湅鍖呮槸鍚﹀瓨鍦細

```bash
ros2 pkg list | grep uploader
```

鏌ョ湅鍙墽琛屾枃浠讹細

```bash
ros2 pkg executables uav_image_uploader
ros2 pkg executables uav_telemetry_uploader
```

鏌ョ湅鍏抽敭璇濋锛?
```bash
ros2 topic list | grep -E 'mavros|photo_saved|image_captured'
```

鏌ョ湅 GPS锛?
```bash
ros2 topic echo /mavros/global_position/global
```

鏌ョ湅鍥剧墖淇濆瓨閫氱煡锛?
```bash
ros2 topic echo /photo_saved
```

鏌ョ湅鍚庡彴鍋ュ悍鐘舵€侊細

```bash
curl http://SERVER_IP/api/health
```

鏌ョ湅鍚庡彴鏈€鏂拌澶囩姸鎬侊細

```bash
curl http://SERVER_IP/api/telemetry/latest
```

鏌ョ湅褰撳墠浠诲姟鍥剧墖锛?
```bash
curl 'http://SERVER_IP/api/capture-images?mission_code=A-03'
```

## 7. 甯歌鏁呴殰

### 7.1 鍚庡彴鐪嬩笉鍒版棤浜烘満瀹炴椂浣嶇疆

妫€鏌ラ『搴忥細

1. MAVROS 鏄惁杩愯銆?2. `/mavros/global_position/global` 鏄惁鏈夌粡绾害銆?3. `uav_telemetry_uploader` 鏄惁鍚姩銆?4. Jetson 鏄惁鑳借闂悗鍙般€?
```bash
curl http://SERVER_IP/api/health
```

5. 鍚庡彴鏄惁鏈夋渶鏂伴仴娴嬨€?
```bash
curl http://SERVER_IP/api/telemetry/latest
```

### 7.2 鍚庡彴鐪嬩笉鍒版柊鍥剧墖鐐?
妫€鏌ラ『搴忥細

1. `camera_sony` 鏄惁淇濆瓨浜嗘柊 ARW銆?2. `photo_saved` 鏄惁鍙戝竷銆?3. `captures2.csv` 鏄惁鍐欏叆瀵瑰簲鏂囦欢鍚嶅拰 GPS銆?4. `uav_image_uploader` 鏄惁杩愯銆?5. `jpg_preview` 鏄惁鐢熸垚 JPG銆?6. 鍚庡彴鏄惁鏈夊搴斾换鍔＄殑鍥剧墖璁板綍銆?
```bash
curl 'http://SERVER_IP/api/capture-images?mission_code=A-03'
```

### 7.3 鍥剧墖涓婁紶閲嶅

`uav_image_uploader` 浣跨敤涓嬮潰鏂囦欢璁板綍宸蹭笂浼犲浘鐗囷細

```text
/home/jetson/hjm/ros2_ws/uav_image_uploader_uploaded.json
```

濡傛灉鍒犻櫎杩欎釜鏂囦欢锛岃妭鐐逛細璁や负鍘嗗彶鍥剧墖閮芥病鏈変笂浼犺繃锛屽彲鑳戒骇鐢熼噸澶嶈褰曘€傚彧鍦ㄦ槑纭渶瑕侀噸浼犳椂鎿嶄綔銆?
### 7.4 ARW 杞?JPG 澶辫触

妫€鏌?`exiftool`锛?
```bash
exiftool -ver
```

妫€鏌?ARW 鏄惁鍖呭惈鍐呭祵棰勮锛?
```bash
exiftool -JpgFromRaw -PreviewImage /path/to/image.ARW
```

### 7.5 鍚庡彴浠诲姟鍒囨崲鍚庡浘鐗囦笉瀵?
纭涓婁紶鏃?`mission_code` 鏄惁鍜屽悗鍙板綋鍓嶄换鍔′竴鑷淬€傚浘鐗囪褰曟寜 `mission_code` 杩囨护锛涗紶閿欎换鍔＄紪鍙蜂細瀵艰嚧鍥剧墖鍑虹幇鍦ㄥ叾浠栦换鍔￠噷銆?
## 8. 浠ｇ爜淇敼鍘熷垯

- 涓嶈鎶婃湇鍔″櫒瀵嗙爜銆丼SH 绉侀挜銆侀樋閲屼簯 AccessKey 鍐欏叆浠撳簱銆?- 浼樺厛鏂板鐙珛 ROS2 鍖咃紝涓嶈鐩存帴鏀瑰凡缁忚兘绋冲畾宸ヤ綔鐨勬媿鐓у寘銆?- 淇濇寔浠ヤ笅璇濋鎺ュ彛绋冲畾锛?  - `/mavros/camera/image_captured`
  - `photo_saved`
  - `/mavros/global_position/global`
- 浠诲姟缂栧彿 `mission_code` 瑕佽疮绌垮浘鐗囦笂浼犲拰閬ユ祴涓婁紶銆?- 涓婁紶鍒板悗鍙扮殑鍥剧墖寤鸿浣跨敤 JPG 棰勮锛屼笉鐩存帴涓婁紶 ARW 鍘熷浘銆?- 鍘熷 ARW 搴斾繚鐣欏湪 Jetson 鎴栧悗缁綊妗ｇ洏锛岀敤浜庣绾块噸寤哄拰璐ㄩ噺杩芥函銆?
## 9. 鍚庣画寤鸿

1. 涓轰笂浼犺妭鐐瑰鍔?systemd 鏈嶅姟锛屽紑鏈鸿嚜鍔ㄥ惎鍔ㄣ€?2. 涓轰换鍔＄紪鍙锋彁渚涚粺涓€閰嶇疆鏂囦欢锛岄伩鍏嶅浘鐗囦笂浼犲拰閬ユ祴涓婁紶鍒嗗埆鎵嬪姩浼犲弬銆?3. 灏?`captures2.csv` 鍗囩骇涓?SQLite 鎴栫粨鏋勫寲鏃ュ織锛屽噺灏?CSV 寮傚父鏍煎紡甯︽潵鐨勮В鏋愰闄┿€?4. 鍚庣画鑻ユ暟鎹噺澧炲ぇ锛屽浘鐗囧簲浠?ECS 鏈湴鐩樿縼绉诲埌闃块噷浜?OSS锛屾暟鎹簱鍙繚瀛?URL 鍜屽厓鏁版嵁銆?5. 濡傛灉瑕佸睍绀轰笁缁撮噸寤恒€侀珮搴︽ā鍨嬫垨鐐逛簯锛屽簲鏂板涓撻棬鐨勬暟鎹帴鍙ｏ紝涓嶅缓璁鐢ㄥ浘鐗囦笂浼犳帴鍙ｃ€?6. 涓哄叧閿妭鐐瑰鍔犳棩蹇楄疆杞紝閬垮厤闀挎湡椋炶娴嬭瘯鍚庢棩蹇楀崰婊＄鐩樸€?

