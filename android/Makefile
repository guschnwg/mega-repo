ANDROID_HOME := $(shell pwd)/sdk
PATH := $(PATH):$(ANDROID_HOME)/platform-tools:$(ANDROID_HOME)/cmdline-tools/latest/bin

start:
	brew install gradle
	brew install android-platform-tools
	curl -L0 --output cli-tools.zip https://dl.google.com/android/repository/commandlinetools-mac-13114758_latest.zip
	unzip cli-tools.zip && rm cli-tools.zip
	mkdir sdk
	mv cmdline-tools sdk/cmdline-tools
	mkdir sdk/cmdline-tools/latest
	mv sdk/cmdline-tools/{lib,bin,NOTICE.txt,source.properties} sdk/cmdline-tools/latest/
	sdkmanager --install "cmdline-tools;19.0"
	sdkmanager --install \
        "platform-tools" \
        "platforms;android-34" \
        "build-tools;34.0.0"

build-app:
	cd MyApplication && \
    	gradle wrapper && \
    	ANDROID_HOME=$(ANDROID_HOME) ./gradlew assembleDebug --warning-mode all && \
    	adb install ./build/outputs/apk/debug/MyApplication-debug.apk && \
        adb shell am start -n com.example.myapplication/.MainActivity

