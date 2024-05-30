const legacyFontSizes = {
  extraLarge: {
    replacementName: 'gigantic',
    replacementValue: 'gigantic'
  },
  extraSmall: {
    replacementName: 'tiny',
    replacementValue: 'tiny'
  }
};

const fontSizes = {
  gigantic: 'gigantic',
  large: 'large',
  medium: 'medium',
  small: 'small',
  tiny: 'tiny'
};

const proxyOptions = {
  get: (target, prop) => {
    if (prop in legacyFontSizes) {
      console.warn(
        `${prop} is deprecated.`,
        `Use ${legacyFontSizes[prop].replacementName} instead`
      )
      return legacyFontSizes[prop]
    }

    return Reflect.get(target, prop);
  }
};

const proxiedFontSize = new Proxy(fontSizes, proxyOptions)
proxiedFontSize.extraSmall;
console.log(proxiedFontSize.gigantic);
console.log(proxiedFontSize)