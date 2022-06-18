declare module "*.mp3" {
  const value: any;
  export default value;
}

declare module "*.module.css" {
  const classes: { [key: string]: string }
  export default classes
}

// For LESS
declare module "*.module.less" {
  const classes: { [key: string]: string }
  export default classes
}

// For SCSS
declare module "*.module.scss" {
  const classes: { [key: string]: string }
  export default classes
}

declare module "*.css" {
  const classes: { [key: string]: string }
  export default classes
}