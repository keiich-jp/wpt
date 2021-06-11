// META: global=window,dedicatedworker
// META: script=/webcodecs/utils.js

const invalidConfigs = [
  {
    comment: 'Emtpy codec',
    config: {
      codec: '',
      width: 640,
      height: 480,
    },
  },
  {
    comment: 'Unrecognized codec',
    config: {
      codec: 'bogus',
      width: 640,
      height: 480,
    },
  },
  {
    comment: 'Width is too large',
    config: {
      codec: 'vp8',
      width: 1000000,
      height: 480,
    },
  },
  {
    comment: 'Height is too large',
    config: {
      codec: 'vp8',
      width: 640,
      height: 1000000,
    },
  },
  {
    comment: 'Invalid scalability mode',
    config: {
      codec: 'vp8',
      width: 640,
      height: 480,
      scalabilityMode: "ABC"
    }
  },
  {
    comment: 'AVC not supported by VP8',
    config: {
      codec: 'vp8',
      width: 640,
      height: 480,
      avc: {
        format: "annexb"
      }
    }
  }
];

invalidConfigs.forEach(entry => {
  promise_test(t => {
    return promise_rejects_js(t, TypeError, VideoEncoder.isConfigSupported(entry.config));
  }, 'Test that VideoEncoder.isConfigSupported() rejects invalid config:' + entry.comment);
});


const validButUnsupportedConfigs = [
  {
    comment: 'Too strenuous accelerated encoding parameters',
    config: {
      codec: "vp8",
      hardwareAcceleration: "require",
      width: 7000,
      height: 7000,
      bitrate: 1,
      framerate: 240,
    }
  },
];

validButUnsupportedConfigs.forEach(entry => {
  let config = entry.config;
  promise_test(async t => {
    let support = await VideoEncoder.isConfigSupported(config);
    assert_false(support.supported);

    let new_config = support.config;
    assert_equals(new_config.codec, config.codec);
    assert_equals(new_config.width, config.width);
    assert_equals(new_config.height, config.height);
    if (config.bitrate)
      assert_equals(new_config.bitrate, config.bitrate);
    if (config.framerate)
      assert_equals(new_config.framerate, config.framerate);
  }, "VideoEncoder.isConfigSupported() doesn't support config:" + entry.comment);
});

const validConfigs = [
  {
    codec: "avc1.42001E",
    hardwareAcceleration: "allow",
    width: 640,
    height: 480,
    bitrate: 5000000,
    framerate: 24,
    avc: {
      format: "annexb"
    },
    futureConfigFeature: 'foo',
  },
  {
    codec: "vp8",
    hardwareAcceleration: "allow",
    width: 800,
    height: 600,
    bitrate: 7000000,
    bitrateMode: "variable",
    framerate: 60,
    scalabilityMode: "L1T2",
    futureConfigFeature: 'foo',
  },
  {
    codec: "vp09.00.10.08",
    hardwareAcceleration: "allow",
    width: 1280,
    height: 720,
    bitrate: 7000000,
    bitrateMode: "constant",
    framerate: 25,
    futureConfigFeature: 'foo',
  }
];

validConfigs.forEach(config => {
  promise_test(async t => {
    let support = await VideoEncoder.isConfigSupported(config);
    assert_true(support.supported);

    let new_config = support.config;
    assert_false(new_config.hasOwnProperty('futureConfigFeature'));
    assert_equals(new_config.codec, config.codec);
    assert_equals(new_config.width, config.width);
    assert_equals(new_config.height, config.height);
    if (config.bitrate)
      assert_equals(new_config.bitrate, config.bitrate);
    if (config.framerate)
      assert_equals(new_config.framerate, config.framerate);
    if (config.bitrateMode)
      assert_equals(new_config.bitrateMode, config.bitrateMode);
  }, "VideoEncoder.isConfigSupported() supports:" + JSON.stringify(config));
});


