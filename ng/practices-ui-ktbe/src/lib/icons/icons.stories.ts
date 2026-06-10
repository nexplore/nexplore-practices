import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeIconArrowBreadcrumbComponent } from './icon-arrow-breadcrumb.component';
import { PuibeIconArrowEndComponent } from './icon-arrow-end.component';
import { PuibeIconArrowRightComponent } from './icon-arrow-right.component';
import { PuibeIconArrowSlidingComponent } from './icon-arrow-sliding.component';
import { PuibeIconArrowComponent } from './icon-arrow.component';
import { PuibeIconChatBubbleWithMessageComponent } from './icon-chat-bubble-with-message.component';
import { PuibeIconChatBubbleComponent } from './icon-chat-bubble.component';
import { PuibeIconCloseComponent } from './icon-close.component';
import { PuibeIconCollapseWidthComponent } from './icon-collapse-width.component';
import { PuibeIconColumnsComponent } from './icon-columns.component';
import { PuibeIconDatepickerTodayComponent } from './icon-datepicker-today.component';
import { PuibeIconDatepickerComponent } from './icon-datepicker.component';
import { PuibeIconDetailComponent } from './icon-detail.component';
import { PuibeIconDownloadComponent } from './icon-download.component';
import { PuibeIconEditComponent } from './icon-edit.component';
import { PuibeIconEnumerationComponent } from './icon-enumeration.component';
import { PuibeIconExpandWidthComponent } from './icon-expand-width.component';
import { PuibeIconExplanationMarkComponent } from './icon-explanation-mark.component';
import { PuibeIconFileComponent } from './icon-file.component';
import { PuibeIconGoBackComponent } from './icon-go-back.component';
import { PuibeIconGoNextComponent } from './icon-go-next.component';
import { PuibeIconHamburgerComponent } from './icon-hamburger.component';
import { PuibeIconHomeComponent } from './icon-home.component';
import { PuibeIconInfoComponent } from './icon-info.component';
import { PuibeIconInvalidComponent } from './icon-invalid.component';
import { PuibeIconKtbeLogoComponent } from './icon-ktbe-logo.component';
import { PuibeIconListItemRectComponent } from './icon-list-item-rect.component';
import { PuibeIconLoginComponent } from './icon-login.component';
import { PuibeIconLogoutComponent } from './icon-logout.component';
import { PuibeIconOptionsComponent } from './icon-options.component';
import { PuibeIconOrganizationComponent } from './icon-organization.component';
import { PuibeIconSearchMobileComponent } from './icon-search-mobile.component';
import { PuibeIconSearchComponent } from './icon-search.component';
import { PuibeIconSettingsComponent } from './icon-settings.component';
import { PuibeIconSpinnerComponent } from './icon-spinner.component';
import { PuibeIconStarComponent } from './icon-star.component';
import { PuibeIconTrashComponent } from './icon-trash.component';
import { PuibeIconUploadComponent } from './icon-upload.component';
import { PuibeIconValidComponent } from './icon-valid.component';
import { PuibeIconWarningComponent } from './icon-warning.component';
import { PuibeIconWithdrawComponent } from './icon-withdraw.component';
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
    'ktbe-logo',
    'login',
    'logout',
    'options',
    'search-mobile',
    'search',
    'spinner',
    'upload',
    'valid',
    'withdraw',
    'star',
    'chat-bubble-with-message',
    'chat-bubble',
    'collapse-width',
    'columns',
    'expand-width',
    'detail',
    'organization',
    'list-item-rect',
    'settings',
    'warning',
    'info',
    'trash',
] as const;

type Args = {
    presentDirs?: boolean;
    dir: IconDirection;
    size?: IconSize;
    icon: (typeof icons)[number];
    color: string;
};

function getTemplate(args: Args) {
    if (args.presentDirs) {
        return Object.values(IconDirection)
            .map(
                (dir) =>
                    `<puibe-icon-${args.icon} class="max-w-20 block" direction=${dir} style="color: ${args.color};" ></puibe-icon-${args.icon}>`
            )
            .join('\n');
    } else {
        return `<puibe-icon-${args.icon} class="max-w-20 block" style="color: ${args.color};" ${
            args.dir ? `direction="${args.dir}"` : ''
        } ${args.size ? `size="${args.size}"` : ''}></puibe-icon-${args.icon}>`;
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
                PuibeIconArrowBreadcrumbComponent,
                PuibeIconArrowComponent,
                PuibeIconArrowEndComponent,
                PuibeIconArrowRightComponent,
                PuibeIconArrowSlidingComponent,
                PuibeIconCloseComponent,
                PuibeIconDatepickerComponent,
                PuibeIconDatepickerTodayComponent,
                PuibeIconDownloadComponent,
                PuibeIconEditComponent,
                PuibeIconEnumerationComponent,
                PuibeIconExplanationMarkComponent,
                PuibeIconFileComponent,
                PuibeIconGoBackComponent,
                PuibeIconGoNextComponent,
                PuibeIconHamburgerComponent,
                PuibeIconHomeComponent,
                PuibeIconInvalidComponent,
                PuibeIconKtbeLogoComponent,
                PuibeIconLoginComponent,
                PuibeIconLogoutComponent,
                PuibeIconOptionsComponent,
                PuibeIconSearchComponent,
                PuibeIconSearchMobileComponent,
                PuibeIconSpinnerComponent,
                PuibeIconUploadComponent,
                PuibeIconValidComponent,
                PuibeIconWithdrawComponent,
                PuibeIconStarComponent,
                PuibeIconChatBubbleWithMessageComponent,
                PuibeIconChatBubbleComponent,
                PuibeIconCollapseWidthComponent,
                PuibeIconColumnsComponent,
                PuibeIconDetailComponent,
                PuibeIconExpandWidthComponent,
                PuibeIconListItemRectComponent,
                PuibeIconOrganizationComponent,
                PuibeIconSettingsComponent,
                PuibeIconWarningComponent,
                PuibeIconInfoComponent,
                PuibeIconTrashComponent,
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
export const KtbeLogo: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'ktbe-logo',
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

export const Withdraw: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'withdraw',
    },
};

export const Star: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'star',
        color: '#EBD3AE',
    },
};

export const ChatBubbleWithMessage: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'chat-bubble-with-message',
    },
};

export const ChatBubble: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'chat-bubble',
    },
};

export const CollapseWidth: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'collapse-width',
    },
};

export const Columns: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'columns',
    },
};

export const Detail: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'detail',
    },
};

export const ExpandWidth: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'expand-width',
    },
};

export const ListItemRect: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'list-item-rect',
    },
};

export const Organization: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'organization',
    },
};

export const Settings: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'settings',
    },
};

export const Info: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'info',
    },
};

export const Warning: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'warning',
    },
};

export const Trash: Story = {
    args: {
        size: IconSize.FIT,
        icon: 'trash',
    },
};

export const Enumeration: Story = {
    render: (_args) => ({
        template: `
        <div class="flex gap-2 flex-col">
        <div class="flex gap-1">
            <puibe-icon-enumeration>1</puibe-icon-enumeration>
            <puibe-icon-enumeration color="red">2</puibe-icon-enumeration>
            <puibe-icon-enumeration color="anthrazit">3</puibe-icon-enumeration>
            <puibe-icon-enumeration color="sand">4</puibe-icon-enumeration>
            <puibe-icon-enumeration color="green">5</puibe-icon-enumeration>
            <puibe-icon-enumeration color="green">23</puibe-icon-enumeration>
            <puibe-icon-enumeration color="green">23233</puibe-icon-enumeration>
        </div>
        <div class="flex gap-1">
            <puibe-icon-enumeration size="xxs" color="sand">1</puibe-icon-enumeration>
            <puibe-icon-enumeration size="xxs" color="red">2</puibe-icon-enumeration>
            <puibe-icon-enumeration size="xxs" color="anthrazit">3</puibe-icon-enumeration>
            <puibe-icon-enumeration size="xxs" color="green">4</puibe-icon-enumeration>
        </div>
        <div class="flex gap-1">
            <puibe-icon-enumeration size="xs" color="sand">1</puibe-icon-enumeration>
            <puibe-icon-enumeration size="xs" color="red">2</puibe-icon-enumeration>
            <puibe-icon-enumeration size="xs" color="anthrazit">3</puibe-icon-enumeration>
            <puibe-icon-enumeration size="xs" color="green">4</puibe-icon-enumeration>
        </div>
        <div class="flex gap-1">
            <puibe-icon-enumeration size="s" color="sand">1</puibe-icon-enumeration>
            <puibe-icon-enumeration size="s" color="red">2</puibe-icon-enumeration>
            <puibe-icon-enumeration size="s" color="anthrazit">3</puibe-icon-enumeration>
            <puibe-icon-enumeration size="s" color="green">4</puibe-icon-enumeration>
        </div>
        <div class="flex gap-1">
            <puibe-icon-enumeration size="m" color="sand">1</puibe-icon-enumeration>
            <puibe-icon-enumeration size="m" color="red">2</puibe-icon-enumeration>
            <puibe-icon-enumeration size="m" color="anthrazit">3</puibe-icon-enumeration>
            <puibe-icon-enumeration size="m" color="green">4</puibe-icon-enumeration>
        </div>
        <div class="flex gap-1">
            <puibe-icon-enumeration size="l" color="sand">1</puibe-icon-enumeration>
            <puibe-icon-enumeration size="l" color="red">2</puibe-icon-enumeration>
            <puibe-icon-enumeration size="l" color="anthrazit">3</puibe-icon-enumeration>
            <puibe-icon-enumeration size="l" color="green">4</puibe-icon-enumeration>
        </div>
        </div>
        `,
    }),
};
