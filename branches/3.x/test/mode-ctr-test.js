YUI.add('mode-ctr-test', function (Y) {
    var C = CryptoJS;

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'CTR',

        testEncryptor: function () {
            var message = C.lib.WordArray.create([
                0x01234567, 0x89abcdef, 0xfedcba98, 0x76543210,
                0x01234567, 0x89abcdef, 0xfedcba98, 0x76543210
            ]);
            var key = C.lib.WordArray.create([0x00000000, 0x00000000, 0x00000000, 0x00000000]);
            var iv = C.lib.WordArray.create([0x45670123, 0xcdef89ab, 0x45670123, 0xcdef89ab]);

            // Compute expected
            var expected = message.clone();
            var aes = C.algo.AES.createEncryptor(key);

            // Counter initialized with IV
            var counter = iv.clone();

            // First block XORed with encrypted counter
            var keystream = counter.words.slice(0);
            aes._encryptBlock(keystream, 0);
            for (var i = 0; i < 4; i++) {
                expected.words[i] ^= keystream[i];
            }

            // Subsequent blocks XORed with encrypted incremented counter
            counter.words[3]++;
            var keystream = counter.words.slice(0);
            aes._encryptBlock(keystream, 0);
            for (var i = 4; i < 8; i++) {
                expected.words[i] ^= keystream[i % 4];
            }

            // Compute actual
            var actual = C.AES.encrypt(message, key, { iv: iv, mode: C.mode.CTR, padding: C.pad.NoPadding }).ciphertext;

            // Test
            Y.Assert.areEqual(expected.toString(), actual);
        },

        testDecryptor: function () {
            var message = C.lib.WordArray.create([
                0x01234567, 0x89abcdef, 0xfedcba98, 0x76543210,
                0x01234567, 0x89abcdef, 0xfedcba98, 0x76543210
            ]);
            var key = C.lib.WordArray.create([0x00000000, 0x00000000, 0x00000000, 0x00000000]);
            var iv = C.lib.WordArray.create([0x45670123, 0xcdef89ab, 0x45670123, 0xcdef89ab]);

            var encrypted = C.AES.encrypt(message, key, { iv: iv, mode: C.mode.CTR, padding: C.pad.NoPadding });
            var decrypted = C.AES.decrypt(encrypted, key, { iv: iv, mode: C.mode.CTR, padding: C.pad.NoPadding });

            Y.Assert.areEqual(message.toString(), decrypted);
        }
    }));
}, '$Rev$');