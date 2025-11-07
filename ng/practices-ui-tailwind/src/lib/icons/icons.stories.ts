import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiIconArrowBreadcrumbComponent } from './icon-arrow-breadcrumb.component';
import { PuiIconArrowEndComponent } from './icon-arrow-end.component';
import { PuiIconArrowRightComponent } from './icon-arrow-right.component';
import { PuiIconArrowSlidingComponent } from './icon-arrow-sliding.component';
import { PuiIconArrowComponent } from './icon-arrow.component';
import { PuiIconCloseComponent } from './icon-close.component';
import { PuiIconDatepickerTodayComponent } from './icon-datepicker-today.component';
import { PuiIconDatepickerComponent } from './icon-datepicker.component';
import { PuiIconDownloadComponent } from './icon-download.component';
import { PuiIconEditComponent } from './icon-edit.component';
import { PuiIconEnumerationComponent } from './icon-enumeration.component';
import { PuiIconExplanationMarkComponent } from './icon-explanation-mark.component';
import { PuiIconFileComponent } from './icon-file.component';
import { PuiIconGoBackComponent } from './icon-go-back.component';
import { PuiIconGoNextComponent } from './icon-go-next.component';
import { PuiIconHamburgerComponent } from './icon-hamburger.component';
import { PuiIconHomeComponent } from './icon-home.component';
import { PuiIconInvalidComponent } from './icon-invalid.component';
import { PuiIconLoginComponent } from './icon-login.component';
import { PuiIconLogoutComponent } from './icon-logout.component';
import { PuiIconOptionsComponent } from './icon-options.component';
import { PuiIconTailwindLogoComponent } from './icon-pui-logo.component';
import { PuiIconSearchMobileComponent } from './icon-search-mobile.component';
import { PuiIconSearchComponent } from './icon-search.component';
import { PuiIconSpinnerComponent } from './icon-spinner.component';
import { PuiIconUploadComponent } from './icon-upload.component';
import { PuiIconValidComponent } from './icon-valid.component';
import { IconDirection, IconSize } from './icon.interface';

const icons = [
    'arrow-breadcrumb',
    'arrow-end',
    'arrow-right',
    'arrow-sliding',
    'arrow',
    'close',
    'datepicker-today',
    'datepicker',
    'download',
    'edit',
    'explanation-mark',
    'file',
    'go-back',
    'go-next',
    'hamburger',
    'home',
    'invalid',
    'pui-logo',
    'login',
    'logout',
    'options',
    'search-mobile',
    'search',
    'spinner',
    'upload',
    'valid',
] as const;

type Args = {
    presentDirs?: boolean;
    dir: IconDirection;
    size?: IconSize;
    icon: (typeof icons)[number];
};

function getTemplate(args: Args) {
    if (args.presentDirs) {
        return Object.values(IconDirection)
            .map((dir) => `<pui-icon-${args.icon} class="max-w-20 block" direction=${dir}></pui-icon-${args.icon}>`)
            .join('\n');
    } else {
        return `<pui-icon-${args.icon} class="max-w-20 block" ${args.dir ? `direction="${args.dir}"` : ''} ${
            args.size ? `size="${args.size}"` : ''
        }></pui-icon-${args.icon}>`;
    }
}

const meta: Meta<Args> = {
    title: 'PUIBE/icons',
    tags: ['autodocs'],
    argTypes: {
        icon: { type: { name: 'enum', value: [...icons] } },
        dir: {
            type: {
                name: 'enum',
                value: [IconDirection.DOWN, IconDirection.LEFT, IconDirection.UP, IconDirection.RIGHT],
            },
        },
        size: {
            type: {
                name: 'enum',
                value: [IconSize.NONE, IconSize.FIT, IconSize.L, IconSize.M, IconSize.S, IconSize.XS],
            },
        },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuiIconArrowBreadcrumbComponent,
                PuiIconArrowComponent,
                PuiIconArrowEndComponent,
                PuiIconArrowRightComponent,
                PuiIconArrowSlidingComponent,
                PuiIconCloseComponent,
                PuiIconDatepickerComponent,
                PuiIconDatepickerTodayComponent,
                PuiIconDownloadComponent,
                PuiIconEditComponent,
                PuiIconEnumerationComponent,
                PuiIconExplanationMarkComponent,
                PuiIconFileComponent,
                PuiIconGoBackComponent,
                PuiIconGoNextComponent,
                PuiIconHamburgerComponent,
                PuiIconHomeComponent,
                PuiIconInvalidComponent,
                PuiIconTailwindLogoComponent,
                PuiIconLoginComponent,
                PuiIconLogoutComponent,
                PuiIconOptionsComponent,
                PuiIconSearchComponent,
                PuiIconSearchMobileComponent,
                PuiIconSpinnerComponent,
                PuiIconUploadComponent,
                PuiIconValidComponent,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: getTemplate(args),
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Demo: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'arrow',
        presentDirs: false,
    },
};

export const Arrow: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'arrow',
        presentDirs: true,
    },
};

export const ArrowBreadcrumb: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'arrow-breadcrumb',
        presentDirs: true,
    },
};

export const Datepicker: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'datepicker',
    },
};

export const Spinner: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'spinner',
    },
};

export const Valid: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'valid',
    },
};

export const Invalid: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'invalid',
    },
};

export const Upload: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'upload',
    },
};
export const ArrowEnd: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'arrow-end',
    },
};
export const ArrowRight: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'arrow-right',
    },
};
export const ArrowSliding: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'arrow-sliding',
    },
};
export const Close: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'close',
    },
};
export const DatepickerToday: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'datepicker-today',
    },
};
export const Download: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'download',
    },
};
export const Edit: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'edit',
    },
};
export const ExplanationMark: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'explanation-mark',
    },
};
export const FileIcon: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'file',
    },
};
export const GoBack: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'go-back',
    },
};
export const GoNext: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'go-next',
    },
};
export const Hamburger: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'hamburger',
    },
};
export const Home: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'home',
    },
};
export const TailwindLogo: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'pui-logo',
    },
};
export const Login: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'login',
    },
};
export const Logout: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'logout',
    },
};
export const Options: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'options',
    },
};
export const SearchMobile: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'search-mobile',
    },
};
export const Search: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'search',
    },
};

export const Enumeration: Story = {
    render: (_args) => ({
        template: `
        <div class="flex gap-2 flex-col">
        <div class="flex gap-1">
            <pui-icon-enumeration>1</pui-icon-enumeration>
            <pui-icon-enumeration color="red">2</pui-icon-enumeration>
            <pui-icon-enumeration color="bgdark">3</pui-icon-enumeration>
            <pui-icon-enumeration color="highlight">4</pui-icon-enumeration>
            <pui-icon-enumeration color="green">5</pui-icon-enumeration>
            <pui-icon-enumeration color="green">23</pui-icon-enumeration>
            <pui-icon-enumeration color="green">23233</pui-icon-enumeration>
        </div>
        <div class="flex gap-1">
            <pui-icon-enumeration size="xxs" color="highlight">1</pui-icon-enumeration>
            <pui-icon-enumeration size="xxs" color="red">2</pui-icon-enumeration>
            <pui-icon-enumeration size="xxs" color="bgdark">3</pui-icon-enumeration>
            <pui-icon-enumeration size="xxs" color="green">4</pui-icon-enumeration>
        </div>  
        <div class="flex gap-1">
            <pui-icon-enumeration size="xs" color="highlight">1</pui-icon-enumeration>
            <pui-icon-enumeration size="xs" color="red">2</pui-icon-enumeration>
            <pui-icon-enumeration size="xs" color="bgdark">3</pui-icon-enumeration>
            <pui-icon-enumeration size="xs" color="green">4</pui-icon-enumeration>
        </div>  
        <div class="flex gap-1">
            <pui-icon-enumeration size="s" color="highlight">1</pui-icon-enumeration>
            <pui-icon-enumeration size="s" color="red">2</pui-icon-enumeration>
            <pui-icon-enumeration size="s" color="bgdark">3</pui-icon-enumeration>
            <pui-icon-enumeration size="s" color="green">4</pui-icon-enumeration>
        </div>
        <div class="flex gap-1">
            <pui-icon-enumeration size="m" color="highlight">1</pui-icon-enumeration>
            <pui-icon-enumeration size="m" color="red">2</pui-icon-enumeration>
            <pui-icon-enumeration size="m" color="bgdark">3</pui-icon-enumeration>
            <pui-icon-enumeration size="m" color="green">4</pui-icon-enumeration>
        </div>  
        <div class="flex gap-1">
            <pui-icon-enumeration size="l" color="highlight">1</pui-icon-enumeration>
            <pui-icon-enumeration size="l" color="red">2</pui-icon-enumeration>
            <pui-icon-enumeration size="l" color="bgdark">3</pui-icon-enumeration>
            <pui-icon-enumeration size="l" color="green">4</pui-icon-enumeration>
        </div>  
        </div>
        `,
    }),
};

