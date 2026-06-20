# 璁烘枃鍥撅細绯荤粺鏋舵瀯鍥句笌鏁版嵁娴佸浘

## 鍥?1 绌哄湴鍗忓悓娴嬩骇绯荤粺鏋舵瀯鍥?

```mermaid
flowchart LR
  subgraph Air["绌轰腑绔細鑷爺鏃犱汉鏈?]
    UAV["鏃犱汉鏈哄钩鍙?]
    CAM["Sony A7C2 鐩告満"]
    GPS["椋炴帶 / GPS / 楂樺害 / 閫熷害"]
    ARW["ARW 鍘熷褰卞儚"]
    JPG["JPG 棰勮鍥?]
    UAVUpload["鏃犱汉鏈轰笂浼犺妭鐐?]
    UAV --> CAM
    UAV --> GPS
    CAM --> ARW --> JPG --> UAVUpload
    GPS --> UAVUpload
  end

  subgraph Ground["鍦伴潰绔細鎵嬫寔娣卞害鐩告満璁惧锛堝彲閫夛級"]
    GDevice["鎵嬫寔鍦伴潰閲囬泦璁惧"]
    Depth["娣卞害鐩告満"]
    Phenotype["鏍珮 / 姣忕璋风矑鏁?/ 璋风矑浣撶Н"]
    GGPS["GPS 鍧愭爣"]
    GUpload["鎵嬫寔璁惧鏁版嵁涓婁紶"]
    GDevice --> Depth --> Phenotype --> GUpload
    GGPS --> GUpload
  end

  subgraph Cloud["浜戠锛氶樋閲屼簯 ECS锛堝凡閮ㄧ讲锛?]
    Nginx["yield-prod-web锛歂ginx 椤甸潰涓庝唬鐞?]
    API["yield-prod-api锛欶astAPI 涓氬姟鏈嶅姟"]
    DB["yield-prod-mysql锛歁ySQL 鎸佷箙鍖栨暟鎹簱"]
    Uploads["uploads / 寤烘ā鐡︾墖 / 鐑姏鐡︾墖"]
    Model["鏃犱汉鏈哄揩閫熶及浜?/ 绌哄湴铻嶅悎鏍″噯"]
    Nginx <--> API
    API <--> DB
    API --> Uploads
    API --> Model
    Model --> DB
  end

  subgraph Web["Web 鍚庡彴"]
    Map["澶х枂绮剧伒 4 寤烘ā鍦板浘"]
    Task["浠诲姟鍖哄煙涓庨琛屽弬鏁拌鍒?]
    Heat["0.5m 鎸囨暟鐑姏鍥捐鍓樉绀?]
    Device["鏃犱汉鏈?/ 鍙€夋墜鎸佽澶囧疄鏃剁姸鎬?]
    Yield["鏃犱汉鏈轰及浜?/ 铻嶅悎浼颁骇"]
  end

  UAVUpload -->|鍥惧儚 + GPS + 閬ユ祴| API
  GUpload -->|RGB / 娣卞害鍥?/ 琛ㄥ瀷鎸囨爣 + GPS| API
  Nginx --> Web
  Web -->|鏌ヨ浠诲姟 / 鍥惧儚 / 鎸囨爣 / 浼颁骇| API
  DB -->|missions / telemetry / capture_images / capture_metrics / yield_results| API
```

## 鍥?2 鍚庡彴绯荤粺鏁版嵁娴佸浘

```mermaid
flowchart TD
  Start["鍒涘缓鎴栭€夋嫨娴嬩骇浠诲姟"] --> Area["鍦板浘璁剧疆浠诲姟鍖哄煙"]
  Area --> Plan["缁撳悎瑕嗙洊鐜?/ 椋炶楂樺害 / 閲嶅彔鐜囪鍒掕埅鐐?]
  Plan --> MissionDB["淇濆瓨 missions 涓?mission_areas"]
  MissionDB --> UAVTask["鐢熸垚鏃犱汉鏈洪琛岄噰闆嗕换鍔?]
  UAVTask --> Dispatch["涓嬪彂 / 鎷夊彇鏃犱汉鏈轰换鍔?]

  Dispatch --> UAVCapture["鏃犱汉鏈洪噰闆嗗奖鍍忎笌瀹氫綅"]
  UAVCapture --> Convert["ARW 杞?JPG"]
  Convert --> UploadImage["涓婁紶 /api/capture-images"]
  UAVCapture --> UploadTelemetry["涓婁紶 /api/telemetry"]

  OptionalGround["鍙€夋嫨閮ㄥ垎鐐瑰湴闈㈤噰鏍?] --> GroundCapture["鎵嬫寔璁惧閲囬泦 RGB / 娣卞害鍥?/ 琛ㄥ瀷涓?GPS"]
  GroundCapture --> UploadMetric["涓婁紶鍥惧儚涓庤〃鍨嬫寚鏍?]
  UploadMetric --> UploadImage

  UploadTelemetry --> TelemetryDB["鍐欏叆 devices 涓?telemetry"]
  UploadImage --> ImageDB["鍐欏叆 capture_images"]
  UploadImage --> MetricDB["鍐欏叆 capture_metrics"]

  MetricDB --> YieldCalc["鎸変换鍔¤绠楀钩鍧囦憨浜?]
  MissionDB --> AreaValue["璇诲彇瑕嗙洊闈㈢Н"]
  YieldCalc --> UavYield["绾棤浜烘満蹇€熶及浜?]
  YieldCalc --> Fusion["鏈夊湴闈㈤噰鏍锋椂杩涜绌哄湴铻嶅悎鏍″噯"]
  AreaValue --> Fusion
  Fusion --> YieldDB["鍐欏叆 yield_results"]
  UavYield --> YieldDB

  TelemetryDB --> WebMap["鍚庡彴鍦板浘瀹炴椂浣嶇疆"]
  ImageDB --> WebMap
  MetricDB --> HeatMap["鎸囨爣鐑姏鍥句笌鎮诞鎸囨爣"]
  YieldDB --> YieldPanel["鎬讳骇閲忎笌缃俊搴﹀睍绀?]

  WebMap --> Review["璇勫鏌ョ湅绌哄湴鍗忓悓閲囬泦杩囩▼"]
  HeatMap --> Review
  YieldPanel --> Review
```


## 宸查儴缃茬郴缁熻鏄?
涓婅堪鍥剧ず瀵瑰簲褰撳墠宸查儴缃茬増鏈€傜郴缁熻繍琛屼簬闃块噷浜?ECS锛屽叕缃戣闂湴鍧€涓?`http://SERVER_IP`锛屾湇鍔″櫒渚х敱 `yield-prod-web`銆乣yield-prod-api` 鍜?`yield-prod-mysql` 涓変釜鏍稿績 Docker 瀹瑰櫒缁勬垚銆傚悗鍙版暟鎹€氳繃 MySQL 鎸佷箙鍖栦繚瀛橈紝椤甸潰鍒锋柊鍚庝换鍔°€佸尯鍩熴€侀噰闆嗙偣銆佸浘鍍忓拰浼颁骇缁撴灉鍧囦粠鏈嶅姟鍣ㄩ噸鏂拌鍙栥€?
